# Timezone Helper Chrome Extension

A Chrome extension that helps you manage and view multiple time zones directly in Google Calendar. Perfect for teams working across different time zones or individuals scheduling meetings with international participants.

## Features

- **Multiple Time Zone Display**: View event times in multiple time zones simultaneously
- **Hover to View**: Simply hover over any calendar event to see the time in your selected time zones
- **Easy Configuration**: Add or remove time zones through a simple interface
- **Clean Design**: Follows Google Material Design principles for a seamless experience
- **Real-time Updates**: Automatically updates as you navigate through your calendar

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

### Setting Up Time Zones

1. Click the Timezone Helper icon in your Chrome toolbar
2. Click "Add Timezone" to add a new time zone
3. Select your desired time zone from the dropdown menu
4. Click "Save" to apply your changes

### Viewing Time Zones in Calendar

1. Open Google Calendar
2. Hover over any calendar event
3. A tooltip will appear showing the event time in all your configured time zones

### Default Time Zones

The extension comes with two default time zones:
- Asia/Singapore
- Australia/Melbourne

You can modify these defaults by editing the `defaultTimezones` array in `popup.js`.

## Development

### Key Components

- **Popup Interface**: Allows users to configure their preferred time zones
- **Content Script**: Integrates with Google Calendar to display time zone information
- **Storage**: Uses Chrome's storage API to save user preferences

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the need for better time zone management in distributed teams
- Built with Google Material Design principles
- Uses the Intl API for accurate time zone calculations 