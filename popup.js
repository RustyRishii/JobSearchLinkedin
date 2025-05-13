function performSearch() {
  const jobTitle = document.getElementById('jobTitle').value.trim();
  const timeRange = document.querySelector('input[name="time"]:checked').value;
  const workLocations = Array.from(document.querySelectorAll('input[name="location"]:checked'))
    .map(checkbox => checkbox.value);
  const easyApply = document.getElementById('easyApply').checked;
  
  if (!jobTitle) {
    alert("Please enter a job title");
    return;
  }

  // Build location filter
  let locationFilter = '';
  if (workLocations.length > 0) {
    const locationValues = workLocations.map(loc => {
      switch(loc) {
        case 'remote': return '2';
        case 'onsite': return '1';
        case 'hybrid': return '3';
        default: return '';
      }
    });
    locationFilter = `&f_WT=${locationValues.join('%2C')}`;
  }

  // Add easy apply filter if selected
  const easyApplyFilter = easyApply ? '&f_LF=f_AL' : '';

  const query = encodeURIComponent(jobTitle);
  const url = `https://www.linkedin.com/jobs/search/?keywords=${query}&f_TPR=${timeRange}${locationFilter}${easyApplyFilter}`;
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