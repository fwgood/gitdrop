# Github 批量删库 取消 star 工具

## 安装

`git clone https://github.com/fwgood/gitdrop`

`yarn add` 或 `npm install`

## 用法

### 配置


在 `config.json`中配置用户名密码

```
{
  "username": "",
  "password": ""
}
```

### 获取列表

命令行执行 `node index.js -g`，将在当前目录下生成仓库信息`repos.json`:

```
{
  "repos_own": [
    "fwgood/vue-swiper",
    "fwgood/MTMessageKeyBoard",
    "fwgood/MTRouter",
    "fwgood/react-native-largelist"
  ],
  "repos_starred": [
    "Ray512512/wifier",
    "18010927657/Job"
  ]
}
```

`repos_own`为当前用户拥有的仓库，`repos_starred`为当前用户点赞过的仓库`，该列表中的仓库为待删除或待取消 star 的仓库

**注意** 　删除操作不可逆，请谨慎操作。

### 删除仓库和取消 star

命令行执行

```
node index.js -d
```
