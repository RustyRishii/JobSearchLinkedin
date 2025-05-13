// Handle collapsible sections
document.querySelector('.collapsible').addEventListener('click', function() {
  this.classList.toggle('active');
  const content = this.nextElementSibling;
  content.classList.toggle('active');
});

function performSearch() {
  const jobTitle = document.getElementById('jobTitle').value.trim();
  const location = document.getElementById('location').value.trim();
  const radius = document.getElementById('radius').value;
  const timeRange = document.querySelector('input[name="time"]:checked').value;
  const workLocations = Array.from(document.querySelectorAll('input[name="location"]:checked'))
    .map(checkbox => checkbox.value);
  const experienceLevels = Array.from(document.querySelectorAll('input[name="experience"]:checked'))
    .map(checkbox => checkbox.value);
  const jobTypes = Array.from(document.querySelectorAll('input[name="jobType"]:checked'))
    .map(checkbox => checkbox.value);
  const easyApply = document.getElementById('easyApply').checked;
  
  if (!jobTitle) {
    alert("Please enter a job title");
    return;
  }

  // Build location filter
  let locationFilter = '';
  if (location) {
    locationFilter = `&location=${encodeURIComponent(location)}&distance=${radius}`;
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
  const url = `https://www.linkedin.com/jobs/search/?keywords=${query}${locationFilter}&f_TPR=${timeRange}${workLocationFilter}${experienceFilter}${jobTypeFilter}${easyApplyFilter}`;
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