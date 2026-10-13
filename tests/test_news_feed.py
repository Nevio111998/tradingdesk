import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('refresh',Path(__file__).resolve().parents[1]/'scripts/refresh_news.py')
r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
NOW='2026-10-13T12:00:00Z'
class FeedTests(unittest.TestCase):
 def test_rss_atom_rdf(self):
  for raw in [b'<rss><channel><item><title>Fed oil &amp; inflation</title><link>https://example.org/1?utm_source=test</link><pubDate>Tue, 13 Oct 2026 10:00:00 GMT</pubDate></item></channel></rss>',b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Fed oil &amp; inflation</title><link href="https://example.org/1"/><published>2026-10-13T10:00:00Z</published></entry></feed>',b'<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/"><item><title>Fed oil &amp; inflation</title><link>https://example.org/1</link><dc:date>2026-10-13T10:00:00Z</dc:date></item></rdf:RDF>']:
   x=r.parse_feed(raw,r.SOURCES[0],NOW)[0];self.assertEqual(x['url'],'https://example.org/1');self.assertEqual(x['publishedAt'],'2026-10-13T10:00:00Z');self.assertIn('Rohstoffe',x['topics']);self.assertIn('USD',x['currencies'])
 def test_bad_dates_links_and_markup(self):
  self.assertIsNone(r.date_value('invalid'));self.assertIsNone(r.date_value('2026-10-13T10:00:00'))
  self.assertEqual(r.canonical_url('javascript:alert(1)'), '')
  with self.assertRaises(ValueError):r.parse_feed(b'<html>blocked</html>',r.SOURCES[0],NOW)
 def test_failure_retains_old_timestamp(self):
  item={'id':'a','url':'https://example.org/1','title':'Title','publishedAt':'2026-10-12T10:00:00Z','fetchedAt':'2026-10-12T11:00:00Z','sourceId':'fed','currencies':['USD'],'topics':[]}
  prev={'sources':[{'id':'fed','lastSuccessAt':'2026-10-12T11:00:00Z'}],'items':[item]}
  def fail(*args):raise ValueError('offline')
  out=r.collect(prev,fetcher=fail,now=NOW)
  self.assertEqual(out['items'],[item]);self.assertEqual(out['sources'][0]['status'],'unavailable');self.assertEqual(out['sources'][0]['lastSuccessAt'],'2026-10-12T11:00:00Z')
 def test_dedup_and_future_exclusion(self):
  def get(source,now):return [{'id':source[0], 'sourceId':source[0],'url':'https://example.org/common','publishedAt':NOW,'currencies':source[4],'topics':source[5]}, {'id':'future','url':'https://example.org/future','publishedAt':'2027-01-01T00:00:00Z'}]
  out=r.collect(fetcher=get,now=NOW);self.assertEqual(len(out['items']),1);self.assertEqual(len(out['items'][0]['currencies']),8)
if __name__=='__main__':unittest.main()
