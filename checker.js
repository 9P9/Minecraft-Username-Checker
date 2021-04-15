const request = require('request');
const chalk = require('chalk');
const prompt = require('prompt');
const fs = require('fs');
const proxies = fs.readFileSync('proxies.txt', 'utf-8').replace(/\r/gi, '').split('\n');
const usernames = [...new Set(require('fs').readFileSync('usernames.txt', 'utf-8').replace(/\r/g, '').split('\n'))];

const cheerio = require('cheerio');
const dateFormat = require('dateformat');

process.on('uncaughtException', e => {});
process.on('uncaughtRejection', e => {});
process.warn = () => {};

var available = 0;
var unavailable = 0;
var rate = 0;
var checked = 0;

function write(content, file) {
    fs.appendFile(file, content, function(err) {
    });
}

function check(username) {
    var proxy = proxies[Math.floor(Math.random() * proxies.length)];
    request({
        method: "GET",
        url: `https://api.mojang.com/users/profiles/minecraft/${username}`,
		proxy: `http://` + proxy, 
        'timeout': 2500,
        json: true,
    }, (err, res, body) => {
        if (res && res.statusCode === 200) {
            unavailable++;
            console.log(chalk.red("[%s] (%s/%s/%s) [Not Available] Username: %s | Proxy: %s"), res.statusCode, available, checked, usernames.length, username, proxy);
            write(username + "\n", "usernames/mojang_unavailable.txt");
		}
		else if (res && res.statusCode === 204) {
			available++;
			console.log(chalk.green(`[%s] (%s/%s/%s) [Available] Username: %s | Proxy: %s`), res.statusCode, available, checked, usernames.length, username, proxy);
			write(username + "\n", "usernames/mojang_available.txt");

        } else if (res && res.statusCode === 429) {
            rate++;
            console.log(chalk.red("[%s] (%s) Proxy: %s has been rate limited".inverse), res.statusCode, rate, proxy);
            check(username);
		}
		else{
			check(username);
		}

        checked = available + unavailable;
        process.title = `[Minecraft Usernames Checker] - ${checked}/${usernames.length} Total Checked | ${available} Available | ${unavailable} Unavailable | ${rate} Rate Limited`;
    });
}

function getAvailabilityTime(data) {

  const $ = cheerio.load(data);
  const timeSelector = 'time#availability-time';

  if($(timeSelector).length) {
    return `available at ${dateFormat($(timeSelector).attr('datetime'), 'mm/dd/yyyy')}`;
  } else {
	if (data.indexOf('Unavailable') > -1) {
		
		return `unavailable`; 
	} else {
		
		return 'available now';
	}
    
  }

}

function Availability(username) {
 var proxy = proxies[Math.floor(Math.random() * proxies.length)];
  request({
      method: "GET",
      url: `https://namemc.com/name/${username}`,
	  proxy: "http://" + proxy, 
	  'timeout': 2500,
	  headers: { 
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36',	  
	  }
	}, (err, res, body) => {
    if (res && res.statusCode === 200) {
		var data = body;
		var AvailabilityTime = getAvailabilityTime(data); 
			if(AvailabilityTime === "unavailable"){ 
				unavailable++;
				console.log(chalk.red("[%s] (%s/%s/%s) [Not Available] Username: %s | Proxy: %s"), res.statusCode, available, checked, usernames.length, username, proxy);
				write(username + "\n", "usernames/namemc_unavailable.txt");
			}
			else{
				available++;
				console.log(chalk.green(`[%s] (%s/%s/%s) [Available] Username: %s |  Availability: ${AvailabilityTime}  | Proxy: %s`), res.statusCode, available, checked, usernames.length, username, proxy);
				write(username + ` | Availability: ${AvailabilityTime}` + "\n", "usernames/namemc_available.txt");
			}
	}
	else{
		Availability(username);
	}
		checked = available + unavailable;
		process.title = `[Minecraft Usernames Checker] - ${checked}/${usernames.length} Total Checked | ${available} Available | ${unavailable} Unavailable | ${rate} Rate Limited`;
	}) 
}




//Program Startup
function printAsciiLogo() {
  console.log(`
  ${chalk.yellow('┌─────────────────────────────────────────────────────────────────────────────────────────────┐')}   
  ${chalk.yellow('│')} ${chalk.red('███╗   ███╗ ██████╗ ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗███████╗██████╗ ')}${chalk.hex('66ff00')('     ██╗███████╗')} ${chalk.yellow('│')}
  ${chalk.yellow('│')} ${chalk.red('████╗ ████║██╔════╝██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝██╔════╝██╔══██╗')}${chalk.hex('66ff00')('     ██║██╔════╝')} ${chalk.yellow('│')}
  ${chalk.yellow('│')} ${chalk.red('██╔████╔██║██║     ██║     ███████║█████╗  ██║     █████╔╝ █████╗  ██████╔╝')}${chalk.hex('66ff00')('     ██║███████╗')} ${chalk.yellow('│')}
  ${chalk.yellow('│')} ${chalk.red('██║╚██╔╝██║██║     ██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ ██╔══╝  ██╔══██╗')}${chalk.hex('66ff00')('██   ██║╚════██║')} ${chalk.yellow('│')}
  ${chalk.yellow('│')} ${chalk.red('██║ ╚═╝ ██║╚██████╗╚██████╗██║  ██║███████╗╚██████╗██║  ██╗███████╗██║  ██║')}${chalk.hex('66ff00')('╚█████╔╝███████║')} ${chalk.yellow('│')}
  ${chalk.yellow('│')} ${chalk.red('╚═╝     ╚═╝ ╚═════╝ ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝')}${chalk.hex('66ff00')(' ╚════╝ ╚══════╝')} ${chalk.yellow('│')}
  ${chalk.yellow('└─────────────────────────────────────────────────────────────────────────────────────────────┘')}                                                                                           
                                                                                  
  `);
}
printAsciiLogo();
process.title = `[Minecraft Usernames Checker] Created By Luci`;
console.log(chalk.blue("[1] Mojang API Checker (Proxies) [No Date]".inverse));
console.log(chalk.blue("[2] NameMC Checker (Proxies)".inverse));
prompt.start();	
	console.log(""); 
	prompt.get(['options'], function(err, result) {
	console.log('');
	var options = result.options;
		switch(options) {
		case "1":
			console.log(`[Minecraft Username Checker]: Started!`.inverse);
			console.log(`[Checking %s Usernames with %s Proxies!]`.inverse, usernames.length, proxies.length);
			for (var i in usernames) check(usernames[i]);
			break;
			
		case "2":
			for (var i in usernames) Availability(usernames[i]);
			break;
		}
			
		
	})
	