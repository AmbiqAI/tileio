import { EventEmitter } from 'events';

class Notifier extends EventEmitter {
  finished: boolean = false
  notifications: Array<any> = []

  start = () => {
    this.finished = false;
  }

  add = (notification: {message: string, options?: {}}, dismissable?: boolean) => new Promise(resolve => {
    if (this.finished) return;
    this.emit('NEW', {
      ...notification,
      options:{
        variant: 'info',
        preventDuplicate: true,
        ...(notification.options?? {}),
      }
    }, resolve);
  })

  remove = (key: string) => {
    this.emit('REMOVE', key);
  }

  clear = () => {
    this.emit('CLEAR');
  }

  stop = () => {
    this.finished = true;
    this.removeAllListeners();
  }

};

const defaultNotifier = new Notifier();

export default defaultNotifier;
