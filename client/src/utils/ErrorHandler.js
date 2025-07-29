// 에러 처리 유틸리티
export class ErrorHandler {
  static handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    // 에러 타입별 처리
    if (error.name === 'TypeError') {
      console.error('Type error detected. Please check data types.');
    } else if (error.name === 'ReferenceError') {
      console.error('Reference error detected. Please check variable declarations.');
    } else if (error.name === 'RangeError') {
      console.error('Range error detected. Please check array bounds and numeric values.');
    }
    
    // 사용자에게 에러 알림 (필요시)
    // this.showUserError(error.message);
  }
  
  static async safeAsync(fn, context = '') {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, context);
      return null;
    }
  }
  
  static safeSync(fn, context = '') {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context);
      return null;
    }
  }
  
  static validateNoteBlock(noteBlock) {
    if (!noteBlock) {
      throw new Error('NoteBlock is null or undefined');
    }
    
    if (typeof noteBlock.timing !== 'number') {
      throw new Error('NoteBlock timing must be a number');
    }
    
    if (typeof noteBlock.lane !== 'number' || noteBlock.lane < 1 || noteBlock.lane > 4) {
      throw new Error('NoteBlock lane must be a number between 1 and 4');
    }
    
    if (!noteBlock.key) {
      throw new Error('NoteBlock key is required');
    }
    
    return true;
  }
  
  static validateGameState(gameState) {
    if (!gameState) {
      throw new Error('Game state is null or undefined');
    }
    
    if (typeof gameState.currentCombo !== 'number') {
      throw new Error('Current combo must be a number');
    }
    
    if (typeof gameState.totalScore !== 'number') {
      throw new Error('Total score must be a number');
    }
    
    return true;
  }
} 