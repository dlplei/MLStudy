"""
结构化日志工具
"""
import logging
import sys
from pathlib import Path
from typing import Any, Dict, Optional
from pythonjsonlogger import jsonlogger
from app.config import settings


class StructuredLogger:
    """结构化日志记录器"""
    
    def __init__(self):
        self.logger = logging.getLogger('ml_demo_api')
        self.logger.setLevel(getattr(logging, settings.LOG_LEVEL))
        
        # 确保日志目录存在
        log_path = Path(settings.LOG_FILE)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        # JSON 格式化器
        json_formatter = jsonlogger.JsonFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s %(request_id)s %(category)s'
        )
        
        # 控制台处理器
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(json_formatter)
        self.logger.addHandler(console_handler)
        
        # 文件处理器
        file_handler = logging.FileHandler(settings.LOG_FILE)
        file_handler.setFormatter(json_formatter)
        self.logger.addHandler(file_handler)
    
    def _log(self, level: str, category: str, message: str, data: Optional[Dict[str, Any]] = None, request_id: Optional[str] = None):
        """内部日志方法"""
        log_data = {
            'category': category,
            'request_id': request_id or '',
            **(data or {})
        }
        
        log_method = getattr(self.logger, level.lower())
        log_method(message, extra=log_data)
    
    def debug(self, category: str, message: str, data: Optional[Dict[str, Any]] = None, request_id: Optional[str] = None):
        """DEBUG 级别日志"""
        self._log('debug', category, message, data, request_id)
    
    def info(self, category: str, message: str, data: Optional[Dict[str, Any]] = None, request_id: Optional[str] = None):
        """INFO 级别日志"""
        self._log('info', category, message, data, request_id)
    
    def warning(self, category: str, message: str, data: Optional[Dict[str, Any]] = None, request_id: Optional[str] = None):
        """WARNING 级别日志"""
        self._log('warning', category, message, data, request_id)
    
    def error(self, category: str, message: str, data: Optional[Dict[str, Any]] = None, request_id: Optional[str] = None):
        """ERROR 级别日志"""
        self._log('error', category, message, data, request_id)
    
    def log_demo_request(self, entry: Dict[str, Any]):
        """记录演示请求日志"""
        level = 'error' if entry.get('error') else 'info'
        self._log(level, 'DEMO_REQUEST', f"Demo request: {entry['algorithm_name']}", entry, entry.get('request_id'))
    
    def log_llm_call(self, entry: Dict[str, Any]):
        """记录 LLM 调用日志"""
        level = 'error' if entry.get('status') == 'error' else 'info'
        self._log(level, 'LLM_CALL', f"LLM call: {entry['model']} for {entry['algorithm_name']}[{entry['step_index']}]", entry, entry.get('request_id'))


# 全局日志实例
logger = StructuredLogger()
