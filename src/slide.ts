export interface AssetFolder {
  idAlias: string;
  name: string;
  description: string;
  allowedMimeTypes: string;
  staticFileKey: boolean;
}

export interface Asset {
  type: string;
  mimeType: string;
  fileName: string;
  url: string;

  isImageFile: boolean;
  isAudioFile: boolean;
  isTextFile: boolean;

  fileSize: number;
  width: number;
  height: number;
  duration: number;

  assetFolder: AssetFolder;
}

export interface Slide {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  image: Asset;
  displayOrder: number;

  slideShow: SlideShow;
}

export interface SlideShow {
  idAlias: string;
  name: string;
  assetFolder: AssetFolder;
  slides: Array<Slide>;
}

