import imageDownloader from 'image-downloader';

export class ThumbnailDownloader {
  private baseURL = 'http://i.ytimg.com/vi';

  async fetch(folder: string, id: string): Promise<any> {
    const starttime = Date.now();
    try {
      await this.download(folder, id, 'default');
      await this.download(folder, id, '0');
    } catch(err) {
      console.log(err);
    }
    return ((Date.now() - starttime) / 1000);
  }

  private download(folder: string, id: string, name: string): Promise<any> {
    const options = {
      url: `${this.baseURL}/${id}/${name}.jpg`,
      dest: folder,
    };
    return imageDownloader.image(options);
  }
}