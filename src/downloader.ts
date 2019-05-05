import fs from 'fs-extra';

import { YoutubeDownloader } from './youtube-downloader';
import { ThumbnailDownloader } from './thumbnail-downloader';
import { PDFDownloader } from './pdf-downloader';

export class Downloader {
  public youtube: any;
  public thumbnails: any;
  public pdf: any;
  private basePath = './downloaded'

  constructor(options?: any) {
    this.youtube = new YoutubeDownloader(options);
    this.thumbnails = new ThumbnailDownloader();
    this.pdf = new PDFDownloader();
  }

  async fetch(id: string): Promise<any> {
    const dir = `${this.basePath}/${id}`;

    try {
      console.log(`------------------Downloading data for ${id}------------------`);
      const starttime = Date.now();
      /**
       * image download section
       */
      await fs.ensureDir(dir);
      const imageTime = await this.thumbnails.fetch(dir, id);
      console.log(`Downloaded thumbnails in ${imageTime.toFixed(3)}seconds`);

      /**
       * pdf download section
       */
      const pdfTime = await this.pdf.fetch(dir, id);
      console.log(`Downloaded PDF in ${pdfTime.toFixed(3)}seconds`);

      /**
       * Youtube video download section
       */
      await this.youtube.fetch(dir, id);
      return (Date.now() - starttime) / 1000;
    } catch (err) {
      console.error(err);
    }
  }
}