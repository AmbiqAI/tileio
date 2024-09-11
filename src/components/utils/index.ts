import { Device } from "@capacitor/device";
import { isPlatform } from "@ionic/react";
import { Share } from "@capacitor/share";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { saveAs } from 'file-saver';


export async function shareJsonData(json: any, title?: string, filename?: string): Promise<void> {
  console.log(json);
  const info = await Device.getInfo();
  const isMobile = isPlatform("ios") || isPlatform("android") || info.platform === 'ios';
  const canShare = (await Share.canShare()).value;
  if (canShare && isMobile) {
    const rst = await Filesystem.writeFile({
      data: JSON.stringify(json),
      recursive: false,
      encoding: Encoding.UTF8,
      path: filename ?? 'data.json',
      directory: Directory.Cache
    });
    await Share.share({
      title: title ?? 'Json Data',
      dialogTitle: title ?? 'Json Data',
      url: rst.uri,
    });
  } else {
    const blob = new Blob(
      [JSON.stringify(json)],
      { type: "text/plain;charset=utf-8" }
    );
    saveAs(blob, filename ?? 'data.json');
  }
}
