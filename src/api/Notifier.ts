import { EventEmitter } from 'events';

export interface NotifierMessage {
  message: string,
  options?: {
    variant?: 'default' | 'error' | 'success' | 'warning' | 'info',
    preventDuplicate?: boolean,
    [key: string|number]: any;
  }
}

class Notifier extends EventEmitter {
  finished: boolean = false
  notifications: Array<any> = []

  start = () => {
    this.finished = false;
  }

  add = (notification: NotifierMessage, dismissable?: boolean) => new Promise(resolve => {
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
