function getSchema(type: string) {
  return schemas[type];
}

const schemas: any = {
  users: {
    name: { type: "text", label: "Name" },
    avatar: { type: "file", label: "Avatar", drop: true, "upload-temp-endpoint": false, "soft-remove": true }
  },
  notdeletable: ['users']
}

export { getSchema };