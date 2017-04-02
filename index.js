/**
 * Frontend
 */

import ReactDOM from 'react-dom';
import React from 'react';

class App extends React.Component {
  render() {
    return (<div>
      <div>
        <div>temperature</div>
        <div>light</div>
      </div>
      <div>
        <div>noise</div>
        <div>lock</div>
      </div>
    </div>);
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
