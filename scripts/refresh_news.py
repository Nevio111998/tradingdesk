"""Public RSS/Atom headlines only. No user data, API keys or external packages."""
import concurrent.futures
import datetime as dt
import email.utils
import hashlib
import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
UTC = dt.timezone.utc
SOURCES = [
    ('fed', 'Federal Reserve', 'https://www.federalreserve.gov/feeds/press_all.xml', 'https://www.federalreserve.gov/newsevents.htm', ['USD'], ['Zentralbanken']),
    ('ecb', 'EZB', 'https://www.ecb.europa.eu/rss/press.html', 'https://www.ecb.europa.eu/press/html/index.en.html', ['EUR'], ['Zentralbanken']),
    ('boe', 'Bank of England', 'https://www.bankofengland.co.uk/rss/news', 'https://www.bankofengland.co.uk/news', ['GBP'], ['Zentralbanken']),
    ('boj', 'Bank of Japan', 'https://www.boj.or.jp/en/rss/whatsnew.xml', 'https://www.boj.or.jp/en/whatsnew/', ['JPY'], ['Zentralbanken']),
    ('rba', 'Reserve Bank of Australia', 'https://www.rba.gov.au/rss/rss-cb-media-releases.xml', 'https://www.rba.gov.au/media-releases/', ['AUD'], ['Zentralbanken']),
    ('rbnz', 'Reserve Bank of New Zealand', 'https://www.rbnz.govt.nz/feeds/news', 'https://www.rbnz.govt.nz/news-and-events', ['NZD'], ['Zentralbanken']),
    ('boc', 'Bank of Canada', 'https://www.bankofcanada.ca/feed/', 'https://www.bankofcanada.ca/press/', ['CAD'], ['Zentralbanken']),
    ('snb', 'Schweizerische Nationalbank', 'https://www.snb.ch/public/rss/en/mopo', 'https://www.snb.ch/en/news-publications', ['CHF'], ['Zentralbanken']),
    ('bbc-business', 'BBC Business', 'https://feeds.bbci.co.uk/news/business/rss.xml', 'https://www.bbc.com/news/business', [], ['Konjunktur']),
    ('bbc-world', 'BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml', 'https://www.bbc.com/news/world', [], ['Geopolitik']),
]
CURRENCY_PATTERNS = {
    'USD': r'\b(USD|U\.S\.|United States|US economy|Federal Reserve|Fed|American|Trump)\b',
    'EUR': r'\b(EUR|euro|eurozone|ECB|European Central Bank|Germany|German|France|French)\b',
    'GBP': r'\b(GBP|UK|U\.K\.|Britain|British|Bank of England|sterling)\b',
    'JPY': r'\b(JPY|Japan|Japanese|yen|Bank of Japan)\b',
    'AUD': r'\b(AUD|Australia|Australian|RBA)\b',
    'NZD': r'\b(NZD|New Zealand|RBNZ)\b',
    'CAD': r'\b(CAD|Canada|Canadian|Bank of Canada)\b',
    'CHF': r'\b(CHF|Switzerland|Swiss|SNB)\b',
}
TOPIC_PATTERNS = {
    'Zentralbanken': r'\b(central bank|interest rates?|monetary|Fed|ECB|BoE|BoJ|RBA|RBNZ|SNB)\b',
    'Konjunktur': r'\b(inflation|GDP|growth|jobs|employment|economy|economic|recession|prices|trade)\b',
    'Geopolitik': r'\b(war|conflict|sanctions?|tariffs?|election|military|attack|ceasefire|missile|Iran|Ukraine)\b',
    'Rohstoffe': r'\b(oil|gas|energy|OPEC|copper|gold|iron ore|dairy|commodity|commodities|crude)\b',
}
def iso(value):
    return value.astimezone(UTC).isoformat().replace('+00:00', 'Z')
def date_value(value):
    try:
        d = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
    except (ValueError, TypeError, AttributeError):
        try: d = email.utils.parsedate_to_datetime(value)
        except (ValueError, TypeError, AttributeError): return None
    # A source without a timezone is not assigned an invented instant.
    return iso(d) if d.tzinfo else None

def clean_text(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]*>', '', value or ''))).strip()

def canonical_url(value, base=''):
    u = urllib.parse.urlsplit(urllib.parse.urljoin(base, value or ''))
    if u.scheme not in ('http', 'https') or not u.hostname or u.username or u.password: return ''
    query = [(k,v) for k,v in urllib.parse.parse_qsl(u.query, keep_blank_values=True) if not k.lower().startswith('utm_') and k.lower() not in ('fbclid','gclid')]
    return urllib.parse.urlunsplit((u.scheme,u.netloc,u.path,urllib.parse.urlencode(query),''))

def tag_name(el): return el.tag.rsplit('}', 1)[-1]
def child_text(el, names):
    for c in el:
        if tag_name(c) in names:
            text = ''.join(c.itertext()).strip()
            if text: return text
    return ''

def parse_feed(raw, source, fetched_at):
    if b'<!ENTITY' in raw.upper(): raise ValueError('XML entities are not supported')
    root = ET.fromstring(raw)
    if tag_name(root).lower() not in ('rss','rdf','feed'): raise ValueError('Not an RSS/Atom feed')
    sid,name,url,homepage,currencies,topics = source
    out=[]
    for el in root.iter():
        if tag_name(el) not in ('item','entry'): continue
        title=clean_text(child_text(el, ['title']))[:500]
        link=child_text(el, ['link'])
        if not link:
            link=next((c.get('href','') for c in el if tag_name(c)=='link' and c.get('rel','alternate')=='alternate'), '')
        link=canonical_url(link,url)
        if not title or not link: continue
        pub=date_value(child_text(el,['pubDate','published','date','updated']))
        cc=set(currencies); tt=set(topics)
        for code,pattern in CURRENCY_PATTERNS.items():
            if re.search(pattern,title,re.I): cc.add(code)
        for topic,pattern in TOPIC_PATTERNS.items():
            if re.search(pattern,title,re.I): tt.add(topic)
        out.append(dict(id=hashlib.sha256(link.encode()).hexdigest()[:24], title=title,url=link,sourceId=sid,source=name,publishedAt=pub,fetchedAt=fetched_at,currencies=sorted(cc),topics=sorted(tt)))
    if not out: raise ValueError('Feed contained no usable headlines')
    return out[:60]

def fetch_source(source, now):
    req=urllib.request.Request(source[2], headers={'User-Agent':'TradingDesk-News/1.0 (public RSS reader)','Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml'})
    with urllib.request.urlopen(req,timeout=20) as res:
        raw=res.read(2_000_001)
        if len(raw)>2_000_000: raise ValueError('Feed too large')
    return parse_feed(raw,source,now)

def collect(previous=None, fetcher=fetch_source, now=None):
    previous=previous or {};now=now or iso(dt.datetime.now(UTC));clock=dt.datetime.fromisoformat(now.replace('Z','+00:00'))
    old_sources={s['id']:s for s in previous.get('sources',[]) if 'id' in s}; items=[];statuses=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        futures={s[0]:pool.submit(fetcher,s,now) for s in SOURCES}
        for s in SOURCES:
            sid,name,url,home,*_=s
            status=dict(id=sid,name=name,url=home,feedUrl=url,checkedAt=now,lastSuccessAt=old_sources.get(sid,{}).get('lastSuccessAt'))
            try:
                rows=futures[sid].result();status.update(status='ok',lastSuccessAt=now)
            except Exception as e:
                rows=[i for i in previous.get('items',[]) if i.get('sourceId')==sid]
                status.update(status='unavailable',error='Abruf nicht verfügbar')
                print(sid+': '+str(e))
            statuses.append(status)
            for item in rows:
                timestamp=item.get('publishedAt') or item.get('fetchedAt')
                parsed=date_value(timestamp)
                if not parsed: continue
                age=clock-dt.datetime.fromisoformat(parsed.replace('Z','+00:00'))
                if dt.timedelta(minutes=-15)<=age<=dt.timedelta(days=30): items.append(item)
    unique={}
    for item in items:
        url=canonical_url(item.get('url'))
        if not url: continue
        if url in unique:
            for k in ('currencies','topics'): unique[url][k]=sorted(set(unique[url].get(k,[])+item.get(k,[])))
        else: unique[url]=dict(item)
    rows=sorted(unique.values(),key=lambda x:x.get('publishedAt') or '',reverse=True)
    return dict(schemaVersion=1,generatedAt=now,sources=statuses,items=rows[:600])

if __name__=='__main__':
    target=ROOT/'feeds/news.json'
    previous=json.loads(target.read_text()) if target.exists() else {}
    data=collect(previous);target.parent.mkdir(exist_ok=True)
    tmp=target.with_suffix('.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');tmp.replace(target)
    print(f"{len(data['items'])} headlines; {sum(s['status']=='ok' for s in data['sources'])}/{len(SOURCES)} feeds available")
