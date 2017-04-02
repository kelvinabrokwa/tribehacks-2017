/**
 * Frontend
 */

import ReactDOM from 'react-dom';
import React from 'react';
import { Sparklines } from 'react-sparklines';
import { characteristicNames, serviceNames } from './names';

var noiseThreshold = 500;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      temp: 0,
      light: 0,
      lock: false,
      noise: 0,
      cookieJar: true
    }
  }
  componentDidMount() {
    var socket = new WebSocket('ws://localhost:8081');
    socket.addEventListener('message', e => {
      try {
        var data = JSON.parse(e.data);
        var { temp, light, lock, noise, cookieJar } = this.state;
        if (serviceNames.tempNoiseLight in data) {
          if (characteristicNames.temperature in data[serviceNames.tempNoiseLight]) {
            temp = data[serviceNames.tempNoiseLight][characteristicNames.temperature];
          }
          if (characteristicNames.noise in data[serviceNames.tempNoiseLight]) {
            noise = data[serviceNames.tempNoiseLight][characteristicNames.noise];
          }
          if (characteristicNames.light in data[serviceNames.tempNoiseLight]) {
            light = data[serviceNames.tempNoiseLight][characteristicNames.light];
          }
        }
        if (serviceNames.lockOpenClose in data) {
          if (characteristicNames.lockOpenClose in data[serviceNames.lockOpenClose]) {
            lock = data[serviceNames.lockOpenClose][characteristicNames.lockOpenClose];
          }
        }
        if (serviceNames.cookieJar in data) {
          if (characteristicNames.cookieJar in data[serviceNames.cookieJar]) {
            cookieJar = data[serviceNames.cookieJar][characteristicNames.cookieJar];
          }
        }
        this.setState({ temp, light, lock, noise, cookieJar });
      } catch (err) {
        console.log(err);
      }
    });
  }
  lock() {
    fetch(`http://localhost:8080/devices/lock/${this.state.lock ? 'unlock' : 'lock'}`, { method: 'POST' })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    var { temp, light, lock, noise, cookieJar } = this.state;
    return (<div className='container full-height full-width white big center'>
      <div className='widget half-width half-height bg-gray' onClick={this.lock.bind(this)}>
        door
        <div>
          <div>
            {lock ? <i className='fa fa-lock'></i> : <i className='fa fa-unlock'></i>}
          </div>
          {lock ? 'locked' : 'unlocked'}
        </div>
      </div>
      <div className='widget half-width half-height bg-green'>
        cookie jar
        <div>
          <i className='fa fa-user-secret'></i>
        </div>
        <div>
          {cookieJar ? 'compromised' : 'secured'}
        </div>
      </div>
      <div className='widget third-width half-height bg-purple'>
        temp
        <div>
          <i className='fa fa-thermometer-half'></i>
        </div>
        <div>
          {temp}
        </div>
        <div>
          <Sparklines data={[5, 10, 5, 20, 8, 15]} limit={5} width={100} height={20} margin={5}>
          </Sparklines>
        </div>
      </div>
      <div className='widget third-width half-height bg-orange'>
        light
        <div>
          <i className='fa fa-sun-o'></i>
        </div>
        <div>
          {light}
        </div>
      </div>
      <div className='widget third-width half-height bg-blue'>
        noise
        <div>
          {noise > noiseThreshold ? <i className='fa fa-volume-up'></i>
 : <i className='fa fa-volume-down'></i>}
        </div>
        {noise}
      </div>
    </div>);
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
