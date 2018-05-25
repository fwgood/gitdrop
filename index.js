const axios = require("axios");
const util = require("util");
const fs = require("fs");
const program = require("commander");
const assert = require("assert");
let config;
async function checkConfig() {
  let existConfig = await fs.existsSync("./config.json");
  if (existConfig) {
    config = JSON.parse(await fs.readFileSync("./config.json"));
    if (!(config.username && config.password)) {
      console.log("请在config.json中配置账号密码");
      return;
    } else {
      try {
        let result = await axios.get("https://api.github.com", {
          auth: {
            username: config.username,
            password: config.password
          }
        });
        if (result.status == 200) {
          return 0;
        }
      } catch (e) {
        console.log("请在config.json中配置正确的账号密码");

        return -1;
      }
    }
  } else {
    console.log("请在config.json中配置账号密码");
    return -2;
  }
}
async function getList() {
  if ((await checkConfig()) == 0) {
    console.log("ok");
  } else {
    process.exit();
  }
  let repos_own = [];
  let repos_starred = [];
  let i = 1;
  while (true) {
    let repo = await axios.get(`https://api.github.com/user/repos?page=${i}`, {
      params: {
        sort: "created"
      },
      auth: {
        username: config.username,
        password: config.password
      }
    });

    for (let i of repo.data) {
      repos_own.push(i.full_name);
    }
    let link = repo.headers.link;
    console.log(link + "\n");
    if (link.includes("next")) {
      i++;
    } else {
      break;
    }
  }
  i = 1;
  while (true) {
    let repo = await axios.get(
      `https://api.github.com/user/starred?page=${i}`,
      {
        auth: {
          username: config.username,
          password: config.password
        }
      }
    );

    for (let i of repo.data) {
      repos_starred.push(i.full_name);
    }
    let link = repo.headers.link;
    console.log(link + "\n");
    if (link.includes("next")) {
      i++;
    } else {
      break;
    }
  }
  let repos = {
    repos_own,
    repos_starred
  };
  fs.writeFile("repos.json", JSON.stringify(repos));
}
async function del() {
  if ((await checkConfig()) !== 0) {
    process.exit();
  } else if (!(await fs.existsSync("./repos.json"))) {
    console.log("请先使用-g选项获取列表");
    process.exit();
  }
  let { repos_own, repos_starred } = JSON.parse(
    await fs.readFileSync("./repos.json")
  );
  for (let i of repos_starred) {
    try {
      let result = await axios.delete(
        `https://api.github.com/user/starred/${i}`,
        {
          auth: {
            username: config.username,
            password: config.password
          }
        }
      );
      if (result.status == 204) {
        console.log(`项目 ${i} 取消star成功`);
      }
    } catch (e) {
      console.log(`项目 ${i} 取消star失败，可能该仓库所属用户已被封号`);
    }
  }
  for (let i of repos_own) {
    try {
      let result = await axios.delete(`https://api.github.com/repos/${i}`, {
        auth: {
          username: config.username,
          password: config.password
        }
      });
      if (result.status == 204) {
        console.log(`项目 ${i} 删除成功`);
      }
    } catch (e) {
      console.log(`项目 ${i} 删除失败`);
    }
  }
}
program
  .version("0.1.0")
  .option("-g, --get", "Get List", getList)
  .option("-d, --delete", "Delete repos and unstar", del)

  .parse(process.argv);
