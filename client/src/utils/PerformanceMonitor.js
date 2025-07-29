// 성능 모니터링 유틸리티
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      noteCount: 0,
      updateTime: 0
    };
    
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.updateInterval = 1000; // 1초마다 업데이트
    this.lastUpdate = 0;
  }
  
  startFrame() {
    this.frameStart = performance.now();
  }
  
  endFrame() {
    const now = performance.now();
    this.frameCount++;
    
    // FPS 계산
    if (now - this.lastTime >= this.updateInterval) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.metrics.frameTime = (now - this.lastTime) / this.frameCount;
      
      // 메모리 사용량 (브라우저 지원시)
      if (performance.memory) {
        this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }
      
      this.frameCount = 0;
      this.lastTime = now;
      this.lastUpdate = now;
      
      // 성능 로그 출력
      this.logPerformance();
    }
  }
  
  updateNoteCount(count) {
    this.metrics.noteCount = count;
  }
  
  measureUpdateTime(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    this.metrics.updateTime = end - start;
    return result;
  }
  
  logPerformance() {
    if (this.metrics.fps < 30) {
      console.warn(`Low FPS detected: ${this.metrics.fps} FPS`);
    }
    
    if (this.metrics.updateTime > 16) {
      console.warn(`Slow update detected: ${this.metrics.updateTime.toFixed(2)}ms`);
    }
    
    console.log(`Performance: ${this.metrics.fps} FPS, ${this.metrics.updateTime.toFixed(2)}ms update, ${this.metrics.noteCount} notes, ${this.metrics.memoryUsage}MB memory`);
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  // 성능 최적화 제안
  getOptimizationSuggestions() {
    const suggestions = [];
    
    if (this.metrics.fps < 30) {
      suggestions.push('FPS가 낮습니다. 노트 수를 줄이거나 렌더링을 최적화하세요.');
    }
    
    if (this.metrics.updateTime > 16) {
      suggestions.push('업데이트 시간이 길습니다. 로직을 최적화하세요.');
    }
    
    if (this.metrics.memoryUsage > 100) {
      suggestions.push('메모리 사용량이 높습니다. 리소스를 정리하세요.');
    }
    
    if (this.metrics.noteCount > 100) {
      suggestions.push('노트 수가 많습니다. 화면 밖의 노트를 제거하세요.');
    }
    
    return suggestions;
  }
} 