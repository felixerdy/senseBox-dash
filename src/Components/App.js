import React, { Component } from "react";
import moment from "moment";
import Sensor from "./Sensor";
import "./App.scss";

const UPDATE_INTERVAL = 300000;

class App extends Component {
  constructor(props) {
    super(props);

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
    };

    this.fetchNewValues = this.fetchNewValues.bind(this);
    this.handleBoxSelectInput = this.handleBoxSelectInput.bind(this);
    this.handleBoxSelectClick = this.handleBoxSelectClick.bind(this);
    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
  }

  componentDidMount() {
    moment.localeData("de");
    // moment.updateLocale("de", {
    //   relativeTime: {
    //     future: "in %s",
    //     past: "vor %s",
    //     s: "ein paar Sekunden",
    //     ss: "%d Sekunden",
    //     m: "einer Minute",
    //     mm: "%d Minuten",
    //     h: "einer Stunde",
    //     hh: "%d Stunden",
    //     d: "einem Tag",
    //     dd: "%d Tagen",
    //     M: "einem Monat",
    //     MM: "%d Monaten",
    //     y: "einem Jahr",
    //     yy: "%d Jahren"
    //   }
    // });
    if (window.localStorage.getItem("boxID")) {
      this.fetchNewValues(window.localStorage.getItem("boxID"));
      setInterval(
        () => this.fetchNewValues(this.state.box._id),
        UPDATE_INTERVAL
      );
    } else {
      this.setState({ loading: true });
      fetch("https://api.opensensemap.org/boxes?minimal=true")
        .then(res => res.json())
        .then(data => {
          this.setState(prevState => {
            return {
              ...prevState,
              searchMode: true,
              allBoxes: data,
              loading: false
            };
          });
        });
    }
    // Notification.requestPermission();
  }

  fetchNewValues(id) {
    fetch("https://api.opensensemap.org/boxes/" + id)
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
          };
        });
      });
  }

  handleBoxSelectClick() {
    if (this.state.box.data.length === 1) {
      this.setState(prevState => {
        return {
          ...prevState,
          searchMode: false
        };
      });
      this.fetchNewValues(this.state.box.data[0]._id);
      window.localStorage.setItem("boxID", this.state.box.data[0]._id);
      setInterval(
        () => this.fetchNewValues(this.state.box.data[0]._id),
        UPDATE_INTERVAL
      );
    }
  }

  handleBoxSelectInput(e) {
    let val = e.target.value;
    this.setState(prevState => {
      return {
        ...prevState,
        box: {
          ...prevState.box,
          name: val,
          data: this.state.allBoxes.filter(box => box.name === val)
        }
      };
    });
  }

  handleEditButtonClick() {
    this.setState(
      prevState => {
        return { ...prevState, searchMode: !prevState.searchMode };
      },
      () => {
        if (this.state.searchMode && this.state.allBoxes.length === 0) {
          this.setState({ loading: true });
          fetch("https://api.opensensemap.org/boxes/")
            .then(res => res.json())
            .then(data => {
              this.setState(prevState => {
                return {
                  ...prevState,
                  allBoxes: data,
                  loading: false
                };
              });
            });
        }
      }
    );
  }

  render() {
    return (
      <div className="App">
        <div className="controls">
          <div className="flex">
            <div className="edit">
              <button onClick={this.handleEditButtonClick}>
                <i className="material-icons">edit</i>
              </button>
            </div>
            {this.state.loading && <h1 />}
            {this.state.searchMode ? (
              <div className="search">
                <input
                  type="text"
                  list="boxes"
                  onChange={this.handleBoxSelectInput}
                  placeholder="senseBox Name"
                />
                <button onClick={this.handleBoxSelectClick}>Auswählen</button>
              </div>
            ) : (
              <div className="name">
                {this.state.loading ? (
                  <h1>Loading Data...</h1>
                ) : (
                  <h1>{this.state.box.name}</h1>
                )}
              </div>
            )}
            <div className="rules" />
          </div>
          <p>
            Last seen{" "}
            {moment(this.state.box.updatedAt)
              .lang("de")
              .fromNow()}
          </p>
        </div>
        <div className="sensors">
          {this.state.box.measurements.sensors &&
            this.state.box.measurements.sensors.map(s => {
              return <Sensor {...s} boxId={this.state.box._id} key={s._id} />;
            })}
        </div>

        <datalist id="boxes">
          {this.state.allBoxes.map(box => (
            <option value={box.name} key={box._id}>
              {box._id}
            </option>
          ))}
        </datalist>
      </div>
    );
  }
}

export default App;
