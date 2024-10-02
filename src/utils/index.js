export function formatTime (seconds) {
  if (seconds < 60) {
      return `${seconds}秒`;
  } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = (seconds % 60).toFixed(2);
      return `${minutes}分钟${remainingSeconds}秒`;
  } else {
      const hours = Math.floor(seconds / 3600);
      seconds = (seconds % 3600).toFixed(2);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = (seconds % 60).toFixed(2);
      return `${hours}小时${minutes}分钟${remainingSeconds}秒`;
  }
}
