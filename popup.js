// Get timezone list
function getTimezoneList() {
  const timezones = Intl.supportedValuesOf('timeZone');
  return timezones.sort((a, b) => {
    // 首先按区域分组
    const regionA = a.split('/')[0];
    const regionB = b.split('/')[0];
    if (regionA !== regionB) {
      return regionA.localeCompare(regionB);
    }
    // 然后按城市名排序
    return a.localeCompare(b);
  });
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

// Create timezone item
function createTimezoneItem() {
  const timezoneList = document.getElementById('timezoneList');
  const timezoneItem = document.createElement('div');
  timezoneItem.className = 'timezone-item';
  
  const select = document.createElement('select');
  const options = getTimezoneOptions();
  
  // 添加默认选项
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a timezone';
  select.appendChild(defaultOption);
  
  // 添加时区选项
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  });
  
  const removeButton = document.createElement('button');
  removeButton.className = 'remove-timezone';
  removeButton.innerHTML = '&#8722;';
  removeButton.title = 'Remove timezone';
  removeButton.onclick = function() {
    timezoneItem.remove();
  };
  
  timezoneItem.appendChild(select);
  timezoneItem.appendChild(removeButton);
  timezoneList.appendChild(timezoneItem);
}

// Save timezones
function saveTimezones() {
  const timezoneItems = document.querySelectorAll('.timezone-item select');
  const timezones = Array.from(timezoneItems).map(select => select.value);
  
  chrome.storage.sync.set({ targetTimezones: timezones }, function() {
    const status = document.getElementById('status');
    status.style.display = 'block';
    setTimeout(() => {
      status.style.display = 'none';
    }, 2000);
  });
}

// Load saved timezones
function loadSavedTimezones() {
  chrome.storage.sync.get(['targetTimezones'], function(result) {
    const timezoneList = document.getElementById('timezoneList');
    timezoneList.innerHTML = '';
    
    if (result.targetTimezones && result.targetTimezones.length > 0) {
      // 加载保存的时区
      result.targetTimezones.forEach(timezone => {
        createTimezoneItem();
        const lastSelect = timezoneList.lastElementChild.querySelector('select');
        lastSelect.value = timezone;
      });
    } else {
      // 设置默认时区：墨尔本和新加坡
      const defaultTimezones = ['Australia/Melbourne', 'Asia/Singapore'];
      defaultTimezones.forEach(timezone => {
        createTimezoneItem();
        const lastSelect = timezoneList.lastElementChild.querySelector('select');
        lastSelect.value = timezone;
      });
      
      // 保存默认时区设置
      chrome.storage.sync.set({ targetTimezones: defaultTimezones });
    }
  });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
  loadSavedTimezones();
  
  document.getElementById('addTimezone').addEventListener('click', createTimezoneItem);
  document.getElementById('save').addEventListener('click', saveTimezones);
}); 