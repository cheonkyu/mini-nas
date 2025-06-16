export class FileUploader {
  async uploadFileInChunks(file: File) {
    const chunkSize = 5 * 1024 * 1024; // 5MB
    const fileId = crypto.randomUUID();
    const chunked = this.chunkFile(fileId, chunkSize, file);
    await Promise.all(chunked.map(formData => this.uploadChunkFile(formData)))
    
    await this.mergeFile(fileId, file.name);
  }

  chunkFile(fileId: string, chunkSize: number, file: File) {
    if (chunkSize <= 0) {
      return []
    }
    const totalChunks = Math.ceil(file.size / chunkSize);

    const result = []
    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('fileId', fileId);
      formData.append('chunkIndex', `${i}`);
      formData.append('totalChunks', `${totalChunks}`);
      formData.append('fileName', file.name);

      result.push(formData);
    }
    return result;
  }
  
  async uploadChunkFile(formData: FormData) {
    return fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData
    });
  }

  async mergeFile(id: string, name: string) {
    return fetch(`/api/upload/merge?fileId=${id}&fileName=${name}`, { method: 'POST' });
  }
}
