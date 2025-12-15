# 开发笔记

## 2025-12-15

### 完成的功能

- [x] 目录列表显示
- [x] 文件预览功能
- [x] JSON 格式化显示
- [x] JSONL 文件支持

### 待完成功能

- [ ] 文件搜索
- [ ] 文件上传
- [ ] 拖拽排序

## 代码示例

```javascript
// 获取文件列表
const files = await fetchFiles('/api/files/list');
console.log(files);
```

## 注意事项

> 请确保后端服务已启动，否则前端无法获取数据。