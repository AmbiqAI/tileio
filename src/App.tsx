import { IonApp } from '@ionic/react';
import { createHashHistory } from 'history';
import { Router, Route, Redirect, Switch } from 'react-router-dom';
import DevicesView from './pages/DevicesView';
import RecordsView from './pages/RecordsView';
import DeviceDetailView from './pages/DeviceDetailView';
import SettingsView from './pages/SettingsView';
import SpeedDialNav from './components/SpeedDial';
import RecordDetailView from './pages/RecordDetailView';
import Notifications from './components/Notifications';
import Snackbar from './components/Snackbar';

export const history = createHashHistory();

export default function App() {
  return (
    <IonApp>
      <Router history={history}>
        <Snackbar maxSnack={5}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Switch>
            <Route exact path="/settings" component={SettingsView} />
            <Route exact path="/devices" component={DevicesView} />
            <Route exact path="/records" component={RecordsView} />
            <Route path="/records/:id" component={RecordDetailView} />
            <Route path="/devices/:id" component={DeviceDetailView} />
            <Redirect from="/" exact to="/devices" />
          </Switch>
          <Notifications />
        </Snackbar>
        <SpeedDialNav />
      </Router>
    </IonApp>
  );
}
