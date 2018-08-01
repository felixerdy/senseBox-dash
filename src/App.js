import React, { Component } from 'react';
import Sensor from './Sensor'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      box: {
        name: "",
        id: "",
        data: {},
        measurements: {}
      },
      allBoxes: [],
      searchMode: false,
      searchInput: "",
      loading: false
    }

    this.fetchNewValues = this.fetchNewValues.bind(this)
    this.handleBoxSelectInput = this.handleBoxSelectInput.bind(this)
    this.handleBoxSelectClick = this.handleBoxSelectClick.bind(this)
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this)
  }

  componentDidMount() {
    if (window.localStorage.getItem("boxID")) {
      this.fetchNewValues(window.localStorage.getItem("boxID"))
      setInterval(() => this.fetchNewValues(this.state.box._id), 60000)
    } else {
      this.setState({loading: true})
      fetch('https://api.opensensemap.org/boxes/')
        .then(res => res.json())
        .then(data => {
          console.log(data)
          this.setState(prevState => {
            return {
              ...prevState,
              searchMode: true,
              allBoxes: data,
              loading: false
            }
          })
        })
    }
    Notification.requestPermission();
  }

  fetchNewValues(id) {
    fetch('https://api.opensensemap.org/boxes/' + id)
      .then(res => res.json())
      .then(data => {
        this.setState(prevState => {
          return {
            ...prevState,
            box: {
              ...prevState.box,
              ...data,
              measurements: data
            }
          }
        })
      })
  }

  handleBoxSelectClick() {
    console.log()
    if (this.state.box.data.length === 1) {
      this.setState(prevState => {
        return {
          ...prevState,
          searchMode: false
        }
      })
      this.fetchNewValues(this.state.box.data[0]._id)
      window.localStorage.setItem("boxID", this.state.box.data[0]._id)
      setInterval(() => this.fetchNewValues(this.state.box.data[0]._id), 60000)
    }
  }

  handleBoxSelectInput(e) {
    let val = e.target.value
    this.setState(prevState => {
      return {
        ...prevState,
        box: {
          ...prevState.box,
          name: val,
          data: this.state.allBoxes.filter(box => box.name === val)
        }
      }
    })
  }

  handleEditButtonClick() {
    this.setState(prevState => { 
      return { ...prevState, searchMode: !prevState.searchMode } 
    }, () => {
      if(this.state.searchMode && this.state.allBoxes.length === 0) {
        this.setState({loading: true})
        fetch('https://api.opensensemap.org/boxes/')
        .then(res => res.json())
        .then(data => {
          this.setState(prevState => {
            return {
              ...prevState,
              allBoxes: data,
              loading: false
            }
          })
        })
      }
    })    
  }

  render() {
    return (
      <div className="App">
        <div className="controls">
          <div className="edit">
            <button onClick={this.handleEditButtonClick}>
              <i className="material-icons">
                edit
              </i>
            </button>
          </div>
          {this.state.loading &&
            <h1>Loading Data...</h1>
          }
          {this.state.searchMode ? (
            <div className="search">
              <input type="text" list="boxes" onChange={this.handleBoxSelectInput} placeholder="senseBox Name" />
              <button onClick={this.handleBoxSelectClick}>Auswählen</button>
            </div>
          ) : (
              <div className="name">
                <h1>{this.state.box.name}</h1>
              </div>
            )
          }
          <div className="rules">

          </div>
        </div>
        <div className="sensors">
        {this.state.box.measurements.sensors &&
          this.state.box.measurements.sensors.map(s => {
            return <Sensor {...s} boxId={this.state._id} key={s._id} />
          })
        }
        </div>

        <datalist id="boxes">
          {this.state.allBoxes.map(box => <option value={box.name} key={box._id}>{box._id}</option>)}
        </datalist>
      </div>
    );
  }
}

export default App;
