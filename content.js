// Monitor Google Calendar page changes
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.addedNodes.length) {
      checkAndUpdateTimeDisplay();
    }
  });
});

// Start observing page changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Debug function to log element structure
function debugElement(element, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}Tag: ${element.tagName}`);
  console.log(`${indent}Classes: ${element.className}`);
  console.log(`${indent}Text: ${element.textContent.trim()}`);
  
  Array.from(element.children).forEach(child => {
    debugElement(child, depth + 1);
  });
}

// Parse time from event element
function parseTimeFromEvent(element) {
  // Parse time information
  const timeRangeMatch = element.textContent.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (timeRangeMatch) {
    let startHours = parseInt(timeRangeMatch[1]);
    const startMinutes = timeRangeMatch[2] ? parseInt(timeRangeMatch[2]) : 0;
    const startPeriod = timeRangeMatch[3] ? timeRangeMatch[3].toUpperCase() : null;
    let endHours = parseInt(timeRangeMatch[4]);
    const endMinutes = timeRangeMatch[5] ? parseInt(timeRangeMatch[5]) : 0;
    const endPeriod = timeRangeMatch[6] ? timeRangeMatch[6].toUpperCase() : null;

    // Get current date
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);
    if (startPeriod === 'PM' && startHours !== 12) {
      startDate.setHours(startHours + 12);
    } else if (startPeriod === 'AM' && startHours === 12) {
      startDate.setHours(0);
    }

    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);
    if (endPeriod === 'PM' && endHours !== 12) {
      endDate.setHours(endHours + 12);
    } else if (endPeriod === 'AM' && endHours === 12) {
      endDate.setHours(0);
    }

    return {
      start: startDate,
      end: endDate
    };
  }

  // Try to match single time
  const timeMatch = element.textContent.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    if (period === 'PM' && hours !== 12) {
      date.setHours(hours + 12);
    } else if (period === 'AM' && hours === 12) {
      date.setHours(0);
    }

    return {
      start: date,
      end: null
    };
  }

  return null;
}

// Format time for a specific timezone
function formatTimeForTimezone(date, timezone) {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting time for timezone:', timezone, error);
    return 'Invalid timezone';
  }
}

// Check and update time display
function checkAndUpdateTimeDisplay() {
  const eventElements = document.querySelectorAll('.fc-event, [role="gridcell"] [role="button"], [data-eventid]');
  
  console.log('Found event elements:', eventElements.length);
  
  eventElements.forEach(element => {
    if (!element.dataset.timezoneHelperProcessed) {
      element.dataset.timezoneHelperProcessed = 'true';
      
      console.log('Processing element:', element);
      debugElement(element);
      
      // Create tooltip element
      const tooltip = createTooltip();
      
      // Add tooltip to the page
      document.body.appendChild(tooltip);
      
      // Show tooltip on hover
      element.addEventListener('mouseenter', function(e) {
        console.log('Mouse entered element:', element);
        
        try {
          chrome.storage.sync.get(['targetTimezones'], function(result) {
            try {
              if (!result.targetTimezones || !Array.isArray(result.targetTimezones) || result.targetTimezones.length === 0) {
                tooltip.textContent = 'Please set your target timezones in the extension settings';
                return;
              }

              const timeInfo = parseTimeFromEvent(element);
              console.log('Parsed time info:', timeInfo);
              
              if (timeInfo) {
                updateTooltip(tooltip, timeInfo, result.targetTimezones);
              } else {
                tooltip.textContent = 'Could not find time in event';
              }
            } catch (error) {
              console.error('Error processing timezones:', error);
              tooltip.textContent = 'Error processing timezones';
            }
            
            // Position tooltip
            showTooltip(tooltip, element);
          });
        } catch (error) {
          console.error('Error accessing storage:', error);
          tooltip.textContent = 'Error accessing extension settings';
        }
      });
      
      // Hide tooltip when mouse leaves
      element.addEventListener('mouseleave', function() {
        hideTooltip(tooltip);
      });
    }
  });
}

// Initial check
checkAndUpdateTimeDisplay();

// Log when the script is loaded
console.log('Timezone Helper extension loaded');

// Create tooltip element
function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: absolute;
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1);
    font-family: 'Google Sans', Arial, sans-serif;
    font-size: 14px;
    color: #202124;
    z-index: 1000;
    min-width: 240px;
    max-width: 320px;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  `;
  return tooltip;
}

// Update tooltip content
function updateTooltip(tooltip, timeInfo, timezones) {
  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  let content = '';
  
  // Display start time
  const startTimeStr = formatTime(timeInfo.start);
  content += `<div style="margin-bottom: 12px; font-weight: 500; color: #1a73e8;">${startTimeStr}`;
  
  // If there's an end time, display time range
  if (timeInfo.end) {
    const endTimeStr = formatTime(timeInfo.end);
    content += ` – ${endTimeStr}`;
  }
  content += '</div>';
  
  timezones.forEach(tz => {
    try {
      const startTime = new Date(timeInfo.start.toLocaleString('en-US', { timeZone: tz }));
      const startTimeStr = formatTime(startTime);
      
      let timeDisplay = startTimeStr;
      
      // If there's an end time, calculate and display end time
      if (timeInfo.end) {
        const endTime = new Date(timeInfo.end.toLocaleString('en-US', { timeZone: tz }));
        const endTimeStr = formatTime(endTime);
        timeDisplay += ` – ${endTimeStr}`;
      }
      
      const tzName = tz.split('/').pop().replace(/_/g, ' ');
      content += `
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #f1f3f4;
        ">
          <span style="
            color: #5f6368;
            font-size: 14px;
            font-weight: 500;
            min-width: 80px;
            margin-right: 16px;
          ">${tzName}</span>
          <span style="
            font-size: 13px;
            color: #202124;
            text-align: right;
          ">${timeDisplay}</span>
        </div>
      `;
    } catch (e) {
      console.error('Error formatting time for timezone:', tz, e);
    }
  });
  
  tooltip.innerHTML = content;
}

// Show tooltip
function showTooltip(tooltip, element) {
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  tooltip.style.left = `${rect.left + scrollLeft}px`;
  tooltip.style.top = `${rect.bottom + scrollTop + 8}px`;
  tooltip.style.opacity = '1';
  tooltip.style.transform = 'translateY(0)';
}

// Hide tooltip
function hideTooltip(tooltip) {
  tooltip.style.opacity = '0';
  tooltip.style.transform = 'translateY(8px)';
} 