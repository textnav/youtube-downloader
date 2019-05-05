import fs from 'fs-extra';
import ytdl from 'ytdl-core';
import readline from 'readline';
import path from 'path';

const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

export class YoutubeDownloader {
  private baseURL = 'http://www.youtube.com/watch?v=';
  private options: {};

  //constructor 
  constructor(options?: any) {
    this.options = options;
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
  }

  public async fetch(dir: string, id: string): Promise<any> {
    try {
      let starttime = Date.now();
      const url = `${this.baseURL}${id}`;

      const info = await ytdl.getInfo(url, this.options);
      await fs.writeJSON(`${dir}/${id}.json`, info);
      const videoFilePath = await this.fetchVideo(url, dir, id);
      /**
       * take screenshot of the video
       */
      const loc = path.resolve(__dirname, `../${videoFilePath}`);
      return await this.screenshots(dir, loc, id, starttime);
    } catch (error) {
      console.log(error);
    }
  }
  private screenshots(dir: string, loc: string, id: string, starttime: number) {
    /**
     * this process is very slow lower size increases the performance
     */
    const size = '320x240';
    return new Promise((resolve, reject) => {
      ffmpeg(loc)
      .on('error', (err: any) => {
        console.log('An error occurred: ' + err.message);
        reject();
      })
      .on('progress', (progress: any) => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(progress.percent * 100).toFixed(2)}% processed`);
        process.stdout.write(`, frames: ${progress.frames}, KPS: ${progress.currentKbps}, FPS: ${progress.currentFps}, Size: ${progress.targetSize}`);
      })
      .on('end', () => {
        const screenshotTime = (Date.now() - starttime) / 1000;
        console.log(`\nDownloaded video and took screenshot in ${screenshotTime.toFixed(3)}seconds`);
        resolve(screenshotTime);
      })
      .screenshots({ count: 5, filename: `${id} at %ssec`, size, folder: dir });
    });
  }
  private async fetchVideo(url: string, dir: string, id: string) {
    return new Promise((resolve, reject) => {
      const video = ytdl(url);
      let starttime: number;
      const videoFilePath = `${dir}/${id}.mp4`;
      const writeStream = fs.createWriteStream(videoFilePath);
      video.pipe(writeStream);
      video.once('response', () => {
        starttime = Date.now();
      });
      video.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded`);
        process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)`);
        process.stdout.write(`, running for: ${downloadedMinutes.toFixed(2)}seconds`);
        process.stdout.write(`, estimated time left: ${(downloadedMinutes / percent - downloadedMinutes).toFixed(2)}seconds`);
      });
      writeStream.on('finish', () => {
        resolve(videoFilePath);
      })
    });
  }
}