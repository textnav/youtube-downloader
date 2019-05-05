import { Downloader } from './downloader';
import { youtubeIds, downloadOptions } from './config';

class YoutubeDownloader {
  private options = {
    quality: downloadOptions.quality,
  };
  private downloader: Downloader;

  constructor() {
    this.downloader = new Downloader(this.options);
  }
  fetch(ids: string[]) {
    this.download(ids);
  }
  private download(ids: string[], index: number = 0) {
    this.downloader.fetch(ids[index])
    .then((time) => {
      console.log(`Total time taken ${time.toFixed(2)}seconds`);
    })
    .finally(() => {
      if (ids[index+1]) {
        this.download(ids, index + 1);
      } else {
        console.log('Finished downloading all');
      }
    });
  }
}

new YoutubeDownloader().fetch(youtubeIds);