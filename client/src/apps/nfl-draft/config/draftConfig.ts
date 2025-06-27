export const draftConfig = {
  // Set the draft date and time (YYYY-MM-DD HH:mm format)
  draftDate: '2025-04-25',
  startTime: '20:00', // 8:00 PM ET
  timeZone: 'America/New_York',
  
  // Lock time is at the start time
  getLockTime: () => {
    const [year, month, day] = draftConfig.draftDate.split('-');
    const [hours, minutes] = draftConfig.startTime.split(':');
    
    // Create date string in ISO format with timezone
    const dateStr = `${year}-${month}-${day}T${hours}:${minutes}:00-04:00`; // -04:00 for ET
    
    // Create date object
    return new Date(dateStr);
  },
  
  // Format time for display
  formatTime: (date: Date) => {
    // Create a new date object with the same time but in the specified timezone
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: draftConfig.timeZone
    };
    
    // Format the time in the specified timezone
    const timeStr = date.toLocaleTimeString('en-US', options);
    
    // Add the timezone indicator
    return `${timeStr} ET`;
  }
}; 