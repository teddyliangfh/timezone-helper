// Get timezone list
function getTimezoneList() {
  return Intl.supportedValuesOf('timeZone');
}

// Get timezone options
function getTimezoneOptions() {
  const timezones = getTimezoneList();
  return timezones.map(timezone => {
    const date = new Date();
    const timeString = date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const offset = date.toLocaleString('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    }).split(' ').pop();
    return {
      value: timezone,
      label: `${timezone} (${offset}) - ${timeString}`
    };
  });
}

// Initialize timezone select
function initializeTimezoneSelect() {
  const timezoneSelect = document.getElementById('timezone');
  const options = getTimezoneOptions();
  
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    timezoneSelect.appendChild(opt);
  });
}

// Save timezone
function saveTimezone() {
  const timezone = document.getElementById('timezone').value;
  chrome.storage.sync.set({ targetTimezones: [timezone] }, function() {
    console.log('Timezone saved:', timezone);
  });
}

// Load saved timezone
function loadSavedTimezone() {
  chrome.storage.sync.get(['targetTimezones'], function(result) {
    if (result.targetTimezones && result.targetTimezones.length > 0) {
      document.getElementById('timezone').value = result.targetTimezones[0];
    }
  });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
  initializeTimezoneSelect();
  loadSavedTimezone();
  
  document.getElementById('save').addEventListener('click', saveTimezone);
}); 