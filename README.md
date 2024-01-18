# Tileio

This web-based application is a powerful tool to create highly customizable dashboards for BLE-enabled Ambiq devices. By leveraging a domain-agnostic API, along with highly customizable device and tile configurations, Tileio can be used to create tailored demos for a wide range of applications.

## Architecture

Tileio discovers and communicates to devices (e.g. Apollo4 Blue EVB) via BLE. A predefined set of BLE characterstics are used to communicate with the device. A device streams data to Tileio through designated _'slots'_. At a high-level a _'slot'_ is a set of similar signals (e.g. accelerometer) captured at the same sampling rate (e.g. 100 Hz). More specifically, a _'slot'_ consists of two components: (1) a set of channels (e.g. X, Y, Z) along with a _'mask'_ and (2) a set of metrics. A device can have up to 4 slots with each slot having up to 4 channels and up to 60 metrics. Each slot requires two BLE characteristcs: one for channels and one for metrics. The application will automatically discover and subscribe to these characterstics.

Furthermore, a device consists of a generic UIO (user input/output) interface that can be used to control the device. The UIO interface consists of 4 toggle buttons and 4 indicator LEDs. Each button and LED can be configured to have a name, on/off state, and on/off text. The UIO interface is handled via a single BLE characterstic.

## Device Configuration

Tileio currently leverages a configuration form that allows the user to customize the device's information. This includes specifiying the device's name, slots, and uio. The app allows downloading and uploading the device configuration as a JSON file to ease the process of configuring multiple devices or sharing with others.

```markdown
DeviceConfiguration:
    * name: Device name
    * location: Device location
    * slots: 1-4 SlotConfig
    * uio: UIOConfig

SlotConfig:
    * name: Slot name
    * type: Slot type (e.g. ecg)
    * unit: Slot units (e.g. mV)
    * fs: Slot sampling rate (e.g. 100 Hz)
    * chs: Channel names
    * metrics: Metric names

UIOConfig:
    * btn0: UIOButtonConfig
    * btn1: UIOButtonConfig
    * btn2: UIOButtonConfig
    * btn3: UIOButtonConfig
    * led0: UIOLedConfig
    * led1: UIOLedConfig
    * led2: UIOLedConfig
    * led3: UIOLedConfig

UIOButtonConfig:
    * name: Button name
    * enabled: Enable button
    * off: Off name
    * on: On name

UIOLedConfig:
    * name: LED name
    * enabled: Enable LED
    * off: Off name
    * on: On name
```

## Dashboard Configuration

Once connected to a device, the user is able to create a dashboard.  A dashboard is composed of a set of user-defined _'tiles'_. A collection of _tiles_ are available that can be customized and added to the dashboard. Similar to the device configuration, the dashboard configuration can be downloaded and uploaded as a JSON file to allow re-use and sharing.

## Additional Information

For examples, please refer to [tileio-demos](https://github.com/AmbiqAI/tileio-demos). This repository contains several demos showcasing Tileio use cases.

For more details on design and usage, please refer to [Tileio docs](https://ambiqai.github.io/tileio-docs).
