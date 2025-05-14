// Handle collapsible sections
document.querySelector('.collapsible').addEventListener('click', function() {
  this.classList.toggle('active');
  const content = this.nextElementSibling;
  content.classList.toggle('active');
});

// Setup location input with autocomplete when popup opens
document.addEventListener('DOMContentLoaded', function() {
  // Focus on the job title input
  document.getElementById('jobTitle').focus();
  
  // Get the container where job title input is located (likely a form or div)
  const jobTitleElement = document.getElementById('jobTitle');
  const container = jobTitleElement.parentElement;
  
  // Create location input if it doesn't exist
  let locationInput = document.getElementById('location');
  if (!locationInput) {
    // Create elements
    const locationDiv = document.createElement('div');
    locationDiv.className = 'form-group';
    
    const locationLabel = document.createElement('label');
    locationLabel.htmlFor = 'location';
    locationLabel.textContent = 'Location';
    
    locationInput = document.createElement('input');
    locationInput.type = 'text';
    locationInput.id = 'location';
    locationInput.className = 'form-control';
    locationInput.placeholder = 'Enter location (city, state, or country)';
    
    // Create autocomplete container
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.id = 'autocomplete-container';
    autocompleteContainer.className = 'autocomplete-items';
    autocompleteContainer.style.display = 'none';
    autocompleteContainer.style.position = 'absolute';
    autocompleteContainer.style.zIndex = '99';
    autocompleteContainer.style.border = '1px solid #ddd';
    autocompleteContainer.style.width = '100%';
    autocompleteContainer.style.maxHeight = '150px';
    autocompleteContainer.style.overflowY = 'auto';
    autocompleteContainer.style.backgroundColor = '#fff';
    
    // Add elements to DOM
    locationDiv.appendChild(locationLabel);
    locationDiv.appendChild(locationInput);
    locationDiv.appendChild(autocompleteContainer);
    
    // Insert after job title input
    container.insertBefore(locationDiv, jobTitleElement.nextSibling);
    
    // Add autocomplete functionality
    setupAutocomplete(locationInput, autocompleteContainer);

    // Add Enter key event listener for location input
    locationInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        if (validateLocation(locationInput.value)) {
          performSearch();
        }
      }
    });
  }
  
  // Load saved location from local storage if available
  try {
    // Try using chrome.storage if available
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['savedLocation'], function(result) {
        if (result.savedLocation) {
          locationInput.value = result.savedLocation;
        }
      });
    } else {
      // Fallback to localStorage
      const savedLocation = localStorage.getItem('savedLocation');
      if (savedLocation) {
        locationInput.value = savedLocation;
      }
    }
  } catch (error) {
    // If all else fails, silently continue without loading saved location
    console.log("Could not load saved location", error);
  }
});

// Common global cities for autocomplete
const commonLocations = [
  "New York", "San Francisco", "London", "Tokyo", "Berlin", "Sydney",
  "Toronto", "Singapore", "Paris", "Seattle", "Austin", "Chicago", "Boston",
  "Los Angeles", "Denver", "Atlanta", "Miami", "Dallas", "Houston", "Phoenix",
  "Remote", "United States", "Canada", "United Kingdom", "Australia", "India",
  "Bengaluru", "Hyderabad", "Chennai", "Mumbai", "Pune",
  "Delhi, India",
  "Delhi, Ohio, United States"

];

// Validate location input
function validateLocation(location) {
  const value = location.trim();
  
  // Empty location is valid (optional field)
  if (value === '') return true;
  
  // Check if it's at least 2 characters
  if (value.length < 2) {
    alert('Please enter a more specific location (at least 2 characters)');
    return false;
  }
  
  // If it's in our predefined list, it's definitely valid
  const isCommonLocation = commonLocations.some(loc => 
    loc.toLowerCase() === value.toLowerCase()
  );
  
  return true;
}

// Set up autocomplete functionality
function setupAutocomplete(inputElement, autocompleteContainer) {
  // Listen for input changes
  inputElement.addEventListener('input', function() {
    const value = this.value.trim().toLowerCase();
    
    // Clear previous suggestions
    autocompleteContainer.innerHTML = '';
    autocompleteContainer.style.display = 'none';
    
    // If empty, don't show suggestions
    if (!value) return;
    
    // Filter matching locations
    const matchingLocations = commonLocations.filter(location => 
      location.toLowerCase().includes(value)
    );
    
    // Create and append suggestion items
    if (matchingLocations.length > 0) {
      autocompleteContainer.style.display = 'block';
      
      matchingLocations.forEach(location => {
        const item = document.createElement('div');
        item.innerHTML = location;
        item.style.padding = '10px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid #ddd';
        
        // Highlight on hover
        item.addEventListener('mouseenter', function() {
          this.style.backgroundColor = '#e9e9e9';
        });
        
        item.addEventListener('mouseleave', function() {
          this.style.backgroundColor = 'transparent';
        });
        
        // Set the input value when clicked
        item.addEventListener('click', function() {
          inputElement.value = location;
          autocompleteContainer.style.display = 'none';
          
          // Save to storage when a location is selected
          try {
            // Try using chrome.storage if available
            if (chrome.storage && chrome.storage.sync) {
              chrome.storage.sync.set({savedLocation: location});
            } else {
              // Fallback to localStorage
              localStorage.setItem('savedLocation', location);
            }
          } catch (error) {
            console.log("Could not save location", error);
          }
        });
        
        autocompleteContainer.appendChild(item);
      });
    }
  });
  
  // Close suggestions when clicking outside
  document.addEventListener('click', function(e) {
    if (e.target !== inputElement) {
      autocompleteContainer.style.display = 'none';
    }
  });
}

function performSearch() {
  const jobTitle = document.getElementById('jobTitle').value.trim();
  
  // Safely check if location element exists
  const locationElement = document.getElementById('location');
  const location = locationElement ? locationElement.value.trim() : '';
  
  // Validate inputs
  if (!jobTitle) {
    alert("Please enter a job title");
    return;
  }
  
  // Validate location if provided
  if (location && !validateLocation(location)) {
    return;
  }
  
  // const radius = document.getElementById('radius').value;
  const timeRange = document.querySelector('input[name="time"]:checked').value;
  const workLocations = Array.from(document.querySelectorAll('input[name="location"]:checked'))
    .map(checkbox => checkbox.value);
  const experienceLevels = Array.from(document.querySelectorAll('input[name="experience"]:checked'))
    .map(checkbox => checkbox.value);
  const jobTypes = Array.from(document.querySelectorAll('input[name="jobType"]:checked'))
    .map(checkbox => checkbox.value);
  const easyApply = document.getElementById('easyApply').checked;
  
  // Build location filter
  let locationFilter = '';
  if (location) {
    locationFilter = `&location=${encodeURIComponent(location)}`;
  }

  // Build work location filter
  let workLocationFilter = '';
  if (workLocations.length > 0) {
    const locationValues = workLocations.map(loc => {
      switch(loc) {
        case 'remote': return '2';
        case 'onsite': return '1';
        case 'hybrid': return '3';
        default: return '';
      }
    });
    workLocationFilter = `&f_WT=${locationValues.join('%2C')}`;
  }

  // Build experience level filter
  let experienceFilter = '';
  if (experienceLevels.length > 0) {
    experienceFilter = `&f_E=${experienceLevels.join('%2C')}`;
  }

  // Build job type filter
  let jobTypeFilter = '';
  if (jobTypes.length > 0) {
    jobTypeFilter = `&f_JT=${jobTypes.join('%2C')}`;
  }

  // Add easy apply filter if selected
  const easyApplyFilter = easyApply ? '&f_LF=f_AL' : '';

  const query = encodeURIComponent(jobTitle);
  // const url = `https://www.linkedin.com/jobs/search/?keywords=${query}${locationFilter}&f_TPR=${timeRange}${workLocationFilter}${experienceFilter}${jobTypeFilter}${easyApplyFilter}`;
  
  // Construct the existing filter part of the query string
  const existingFilterQuery = `&f_TPR=${timeRange}${workLocationFilter}${experienceFilter}${jobTypeFilter}${easyApplyFilter}`;
  
  // Updated URL format to use location instead of geoId
  const url = `https://www.linkedin.com/jobs/search/?keywords=${query}${locationFilter}&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true${existingFilterQuery}`;
  
  chrome.tabs.create({ url });
}

// Handle button click
document.getElementById('searchBtn').addEventListener('click', performSearch);

// Handle enter key press
document.getElementById('jobTitle').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    performSearch();
  }
});