---
layout: note_page
title: Linux How To
title_short: linux_how_to
dateStr: 2019-04-01
category: Linux
tags: notes cheatsheet check
---
Not a place to explain things, but for some quick reference to do things in Linux

<br/>
#### Benchmarking_Flash_Drive

```sh
# General command to use:
# 1. create a large file for benchmarking from device 0
dd if=/dev/zero of=./largefile bs=1M count=1024
# 2. Write to a drive
dd if=path/to/input_file of=/path/to/output_file bs=block_size count=number_of_blocks
# Reference:
# https://www.binarytides.com/linux-test-drive-speed/
# alternatively, use Ubuntu's disk software for benchmark
```

<br/>
#### Burn_Image_To_Flash_Drive

```sh
lsblk -p
  # -> see which devices are connected
umount /dev/sdX[1-9]
  # -> unmount the usb device drives
  # -> replace 'X' with the device letter [a-z]
dd bs=4M if=path/to/linux_image.img of=/dev/sdX conv=fsync status=progress
  # -> the command to copy the image into the drive
  # -> replace 'X' with the device letter [a-z]
sync # flush out write cache so the drive is okay to unmount
```

<br/>
#### Change_hostname_on_Linux_machine

```sh
sudo hostnamectl --transient set-hostname $hostname
sudo hostnamectl --static set-hostname $hostname
sudo hostnamectl --pretty set-hostname $hostname
sudo sed -i s/raspberrypi/$hostname/g /etc/hosts
```

<br/>
#### Check_CPU_Temperature/Volt

```sh
# On RaspberryPi:
/opt/vc/bin/vcgencmd measure_temp
/opt/vc/bin/vcgencmd measure_volts core
# view a list of available commands:
/opt/vc/bin/vcgencmd commands
# Install a tool called lm-sensors
sudo apt install lm-sensors
sudo -i
sensors-detect
sensors # to check various sensor temperatures
# Note this method does not work if the system does not have any sensors attached to it. i.e. like a RaspberryPi
```

<br/>
#### Check_USB_Devices

```sh
lsusb # view a list of plugged in devices via USB ports
dmesg # view the log related to USB devices
```

<br/>
#### Configuring_Locale_Settings

```sh
export LANGUAGE=en_US.UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
locale-gen en_US.UTF-8
dpkg-reconfigure locales
```

<br/>
#### Create_SSH_Key_Pair

```sh
# creates an SSH key pair using RSA encryption and a bit length of 4096
ssh-keygen -m PEM -t rsa -b 4096
cat ~/.ssh/id_rsa.pub
# cp to clipboard
cat ~/.ssh/id_rsa.pub | xclip # on Linux
cat ~/.ssh/id_rsa.pub | pbcopy # on Mac
```

<br/>
#### Disable/Enable_X_Windows_On_Startup

This method works for Ubuntu to disable X window (or Gnome)
```sh
<br/>
#### Older systems
vim /etc/default/grub
# Find the line:
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash" # this enables UI
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash text" # this disables UI
sudo update-grub
startx # can still get back into user-interface in the tty

# Newer systems 15.01 and newer
sudo systemctl set-default multi-user.target # this disables UI
sudo systemctl set-default graphical.target # this enables UI
```

<br/>
#### Disable_wireless_on_startup

```sh
# both of following shows ip address
ifconfig
ip addr show
# take down/up a network interface
ip link set eth1 down
ip link set eth1 up
# alternatively
sudo ifdown wlan0
sudo ifup wlan0
# alternatively
sudo ifconfig wlan0 down
sudo ifconfig wlan0 up
```

<br/>
#### Do_Mount_FileSystem

```sh
mkdir -p /path/to/mountpoint
lsblk # know the device name
ls -l /dev/disk/by-label # show partition name
# alternatively
sudo lsblk -o name,mountpoint,label,size,uuid
mount /dev/sdX /path/to/mountpoint
# enable mount on start up https://wiki.archlinux.org/index.php/Fstab
vim /etc/fstab
# format:
# device    mountpoint    fstype    options   dump    fsck
/dev/sdb1   /path/to/mountpoint   ntfs  defaults  0   1
# View a list of mounted filesystems
less /proc/mounts

# Install support for different filesystems
sudo apt-get install exfat-fuse exfat-utils
```

<br/>
#### Edit_Service_Command

most services has configs under:
- /etc/default/NAME
- /etc/init.d/NAME
- /etc/init/NAME.conf

<br/>
#### Enable_Service_On_Startup

First create a script to run for scheduling the service on startup

Then put it into `/etc/init.d`

Note that the start of the script should have something like this right below the _shbang_
```sh
# The following is called LSBInitScripts
### BEGIN INIT INFO
# Provides:          haltusbpower
# Required-Start:    $all
# Required-Stop:
# Default-Start:     2 3 4 5  (comment: run levels)
# Default-Stop:      0 1 6
# Short-Description: Halts USB power...
### END INIT INFO

# cleans up when the script receives SIGINT or SIGTERM
function cleanup() {
  local pids=$(jobs -pr)
  [ -n "$pids" ] && kill $pids
  exit 0
}

function goodbye() {
  echo ""
  echo "Goodbye..."
  echo ""
}

trap "cleanup" SIGINT SIGTERM
trap "goodbye" EXIT
```

Next step
```sh
update-rc.d <script_name> defaults
# create a file in
cat <<EOF >> /lib/systemd/system/myservice.service
[Unit]
Description=Example systemd service.

[Service]
Type=simple
PIDFile=/var/run/myservice/myservice.pid
LimitNOFILE=16384
ExecStart=/bin/bash /usr/bin/test_service.sh
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target
EOF
sudo chmod 644 /lib/systemd/system/myservice.service
ln -s /lib/systemd/system/myservice.service /etc/systemd/system/myservice.service
ln -s /lib/systemd/system/myservice.service /etc/systemd/system/multi-user.target.wants/myservice.service

systemctl enable myservice
systemctl is-enabled myservice
systemctl is-active myservice
systemctl disable myservice
```
Most services manage their configs in `/etc/<servicename>/<servicename>_config`

More here: https://linoxide.com/linux-how-to/enable-disable-services-ubuntu-systemd-upstart/

Run-levels: http://www.linfo.org/runlevel_def.html

LSBInitScripts: https://wiki.debian.org/LSBInitScripts

<br/>
#### Enable_ssh_on_new_Linux_machine

```sh
mkdir /media/user/dir
mount /dev/sdX /media/user/dir # the partition being mounted should be mbr
touch /media/user/dir/ssh
# how to ssh
ssh username@hostname
# view ssh session opened/closed
cat /var/log/auth.log | grep -v "CRON" | grep "session opened" | less
```

<br/>
#### Enable_ssh_port_forwarding

```sh
vim ~/.ssh/config
Host <host>
HostName <host_name>
StrictHostKeyChecking no
LocalForward <port> <host_name>:<new_port>
LocalForward <port> <host_name>:<new_port>
...
# then this becomes possible:
mysql -h 127.0.0.1 -P 10001 -u <user> -p
# and will be forwarded to the configured host_name
```


<br/>
#### Enable_sshfs

```sh
mkdir /media/remote/fs/mountpoint
sshfs -o idmap=user username@hostname:/path/to/dir /media/remote/fs/mountpoint
# to unmount:
fusermount -u /media/remote/fs/mountpoint
```

<br/>
#### Enable_static_ip_on_Linux_machine

```sh
sudo cat <<EOT >> /etc/dhcpcd.conf
interface eth0
static ip_address=$ip/24
static routers=$dns
static domain_name_servers=$dns
EOT
# alternatively
route add default gw {ROUTER-IP-ADDRESS} {INTERFACE-NAME}
sudo ifconfig eth0 192.168.1.30 netmask 255.255.255.0
# add set this in /etc/network/interfaces file
auto eth0
iface eth0 inet static
    address 192.168.1.30
    network 192.168.1.0
    netmask 255.255.255.0
    broadcast 192.168.1.255
    gateway 192.168.1.1
    dns-nameservers 192.168.1.1
```

<br/>
#### Enable_Disable_Swap_Memory

```sh
sudo dphys-swapfile swapoff && \
sudo dphys-swapfile uninstall && \
sudo update-rc.d dphys-swapfile remove
```

<br/>
#### Find_File_Structure_Difference

```sh
diff -qr dir-1/ dir-2
# alternatively, use a tool called meld
sudo apt-get install meld
```

<br/>
#### Find_Device_Info

```sh
dmesg | egrep -i --color 'cdrom|dvd|cd/rw|writer'
```

<br/>
#### Find_Search_Files

```sh
find ~ -mmin -3 -ls # give files changed in ~ in last 3 minutes
```

<br/>
#### Find_Apt_Package_To_Install

```sh
apt-cache search KEYWORD
apt-get install KEYWORD
# to install .deb file
sudo dpkg -i /path/to/deb/file
# alternatively
sudo apt install /path/to/deb/file
```

<br/>
#### Get_Date_Time_Formatted

```sh
date +%Y%m%d-%H # give format 20190718-02
date +%M # give format 15
```

<br/>
#### Get_My_Ip_Address_On_the_Internet

```sh
# Here are a few ways to get it:
curl ifconfig.me
curl -4/-6 icanhazip.com
curl ipinfo.io/ip
curl api.ipify.org
curl checkip.dyndns.org
dig +short myip.opendns.com @resolver1.opendns.com
host myip.opendns.com resolver1.opendns.com
curl ident.me
curl bot.whatismyipaddress.com
curl ipecho.net/plain
# Following gives the private Ip Address on the LAN:
ifconfig -a
ip addr (ip a)
hostname -I | awk '{print $1}'
ip route get 1.2.3.4 | awk '{print $7}'
(Fedora) Wifi-Settings→ click the setting icon next to the Wifi name that you are connected to → Ipv4 and Ipv6 both can be seen
nmcli -p device show
```

<br/>
#### Make_Time_Elapse_Video_With_Webcam

```sh
streamer -o 0000.jpeg -s 640x480 -j 100 -t 2000 -r 1
ffmpeg -framerate 1/5 -i img%04d.jpeg -c:v libx264 -r 30 -pix_fmt yuv420p out.mp4
ffmpeg -framerate 4 -i %04d.jpeg -c:v libx264 -pix_fmt yuv420p video.mp4
ffmpeg -f concat -safe 0 -i out%01d.mp4 -c copy combined.mp4
```
`-t` says how many frames(images) to record, `-r` says frames per second

<br/>
#### Network_Settings

Usually stored in `/etc/NetworkManager/system-connections/NETGEAR-VPN.nmconnection` for Ubuntu
Might need root access to view
Network logs can be found in `/var/run/syslog`

<br/>
#### RaspberryPi

```sh
# RaspberryPi Configs (terminal and ssh friendly)
sudo raspi-config
```

<br/>
#### Remote_Print_From_Terminal

```sh
lp file.pdf
lpstat -p -d # will list available printers
use options:
  -P 3-5 #for pages, separated by commas
  -o sides=two-sided-long-edge #for print on both sides
  -n 5 #for number of copies
lp filename -P 1-5 -d ps114 -o sides=two-sided-long-edge -n 1
lpr -\# 1 -P ps114 -o sides=two-sided-long-edge filename
cancel printer-name
cancel -u zhongkai
```

<br/>
#### Resize_disk_partitions

```sh
fdisk -l # shows current partitions
```

<br/>
#### Setup_Cronjob

```sh
crontab -e
# Add an entry with the schedule string followed by the command
minute(0-59) hour(0-23) day(1-31) month(1-12) weekday(0-6) command
# Like this:
29 0 * * * /usr/bin/example
```

<br/>
#### Setup_Reverse_Proxy

**Use nginx to set it up**
```sh
sudo apt-get install nginx
# verify going to this machine's ip address and can see the nginx server page
```

Files containing routing rules go in the `/etc/nginx/sites-available/` folder.
To activate those rules you need to create a symlink of those files to the `/etc/nginx/sites-enabled/` folder.
```sh
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com; # domains that will need to be handled
    location / {
        proxy_pass http://10.0.0.3:3000; # the local IP address and port of the machine that your chosen domains should to redirect to
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

You can add multiple config files, a config file can contain multiple server{} server blocks, a server block can contain multiple location{} blocks.

**Use `certbot` to generate certs**
```sh
sudo apt-get install python-certbot-nginx -t stretch-backports
sudo certbot certonly --webroot -w /var/www/example.com/ -d example.com -d www.example.com
```
And the cert files are put in `/etc/letsencrypt/live/example.com/`

Now update the default config with
```sh
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;    server_name example.com www.example.com;    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;    ssl_stapling on;
    ssl_stapling_verify on;    add_header Strict-Transport-Security "max-age=31536000";    access_log /var/log/nginx/sub.log combined;    location /.well-known {
        alias /var/www/example.com/.well-known;
    }    location / {
        # reverse proxy commands
    }
}
```

<br/>
#### View_Port_Binding

```sh
netstat -nlp # add -t if want TCP only
lsof -i TCP
ss -ap
```

<br/>
#### View_Service_Logs

```sh
systemctl --state=failed
systemctl status <service-name>
service <service-name> status
journalctl -u <service-name> -b
```
