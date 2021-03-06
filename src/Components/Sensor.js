import React, { Component } from "react";
import { Sparklines, SparklinesCurve } from "react-sparklines";
import "./Sensor.scss";

const colors = {
  Temperatur: "gold",
  "rel. Luftfeuchte": "mediumturquoise",
  Beleuchtungsstärke: "yellow",
  "UV-Intensität": "palegreen",
  Luftdruck: "lightblue",
  Lautstärke: "thistle",
  "PM2.5": "gainsboro",
  PM10: "lightgray",
};

class Sensor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      detailActive: false,
    };

    this.alertMinMax = this.alertMinMax.bind(this);
  }

  componentDidMount() {
    fetch(
      `https://api.opensensemap.org/boxes/${this.props.boxId}/data/${this.props._id}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ data: data });
      });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.lastMeasurement &&
      this.props.lastMeasurement.value !== prevProps.lastMeasurement.value
    ) {
      fetch(
        `https://api.opensensemap.org/boxes/${this.props.boxId}/data/${this.props._id}`
      )
        .then((res) => res.json())
        .then((data) => this.setState({ data: data }));
    }
  }

  alertMinMax() {
    let min = Math.min(...this.state.data.map((d) => Number(d.value))).toFixed(
      2
    );
    let max = Math.max(...this.state.data.map((d) => Number(d.value))).toFixed(
      2
    );

    let alertText = `48 Stunden Minimum: ${min} ${this.props.unit}\n48 Stunden Maximum: ${max} ${this.props.unit}`;

    alert(alertText);
  }

  render() {
    return (
      <div className="sensor">
        <div
          className="info"
          onClick={() =>
            this.setState({ detailActive: !this.state.detailActive })
          }
        >
          <Sparklines
            data={this.state.data
              .map((d) => d.value)
              .filter((e, i) => i % 40 === 0)
              .reverse()}
            className="sparkLine"
            margin={0}
          >
            <SparklinesCurve color={colors[this.props.title] || "lightblue"} />
          </Sparklines>
          <p className="phenomenon">{this.props.title}</p>
          {this.props.lastMeasurement && (
            <p className="measurement">
              {parseFloat(this.props.lastMeasurement.value).toFixed(2)}{" "}
              {this.props.unit}
            </p>
          )}
        </div>
        <div className={`details ${this.state.detailActive ? "active" : ""}`}>
          {`Min: ${Math.min(
            ...this.state.data.map((d) => Number(d.value))
          ).toFixed(2)} ${this.props.unit}`}
          <br />
          {`Max: ${Math.max(
            ...this.state.data.map((d) => Number(d.value))
          ).toFixed(2)} ${this.props.unit}`}
        </div>
      </div>
    );
  }
}

export default Sensor;
