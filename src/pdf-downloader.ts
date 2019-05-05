import phantom from 'phantom';

export class PDFDownloader {
  private baseURL = 'http://youtu.be';

  async fetch(dir: string, id: string): Promise<any> {
    const starttime = Date.now();
    try {
      const url = `${this.baseURL}/${id}`;
      const ph = await phantom.create();
      const page = await ph.createPage();
      await page.open(url);
      await page.render(`${dir}/${id}.pdf`);
      ph.exit();
    } catch(err) {
      console.log(err);
    }
    return((Date.now() - starttime) / 1000);
  }
}
