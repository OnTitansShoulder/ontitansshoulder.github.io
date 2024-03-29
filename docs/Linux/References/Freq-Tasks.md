---
layout: note_page
title: Freq Linux Tasks
title_short: linux_how_to
dateStr: 2019-04-01
category: Linux
tags: notes cheatsheet check
---

Not a place to explain things, but for some quick reference to do things in Linux

<br/>

### Add_User_To_Sudoers

```sh
# first add user to group sudo
usermod -aG sudo <user>
# makesure this line is in /etc/sudoers
%sudo ALL=(ALL) ALL
```

<br/>

### Benchmarking_Flash_Drive

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

### Boot_into_another_OS_of_Different_GRUB_Version

```sh
# https://howtoubuntu.org/how-to-repair-restore-reinstall-grub-2-with-a-ubuntu-live-cd
lsblk # find out which disk to boot into
sudo mount -t ext4 /dev/sdXY /mnt
sudo mount --bind /dev /mnt/dev &&
sudo mount --bind /dev/pts /mnt/dev/pts &&
sudo mount --bind /proc /mnt/proc &&
sudo mount --bind /sys /mnt/sys
sudo chroot /mnt
grub-install /dev/sdX
grub-install --recheck /dev/sdX
update-grub
exit &&
sudo umount /mnt/sys /mnt/proc /mnt/dev/pts /mnt/dev &&
sudo umount /mnt
```

<br/>

### Burn_Image_To_Flash_Drive

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

### Change_hostname_on_Linux_machine

```sh
sudo hostnamectl --transient set-hostname $hostname
sudo hostnamectl --static set-hostname $hostname
sudo hostnamectl --pretty set-hostname $hostname
sudo sed -i s/<old-hostname>/$hostname/g /etc/hosts
```

### Change_RaspberryPi_OS_Keyboard

```sh
sudo nano /etc/default/keyboard
# update 'XKBLAYOUT' to 'us'
```

<br/>

### Check_CPU_Temperature/Volt

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

### Check_USB_Devices

```sh
lsusb # view a list of plugged in devices via USB ports
dmesg # view the log related to USB devices
```

<br/>

### Configuring_Locale_Settings

```sh
export LANGUAGE=en_US.UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
locale-gen en_US.UTF-8
dpkg-reconfigure locales
```

<br/>

### Create_SSH_Key_Pair

```sh
# creates an SSH key pair using RSA encryption and a bit length of 4096
ssh-keygen -m PEM -t rsa -b 4096
cat ~/.ssh/id_rsa.pub
# cp to clipboard
cat ~/.ssh/id_rsa.pub | xclip # on Linux
cat ~/.ssh/id_rsa.pub | pbcopy # on Mac
```

<br/>

### Disable/Enable_X_Windows_On_Startup

This method works for Ubuntu to disable X window (or Gnome)
```sh
<br/>

### Older systems
vim /etc/default/grub
# Find the line:
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash" # this enables UI
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash text" # this disables UI
sudo update-grub
startx # can still get back into user-interface in the tty

# Newer systems 15.01 and newer
sudo systemctl set-default multi-user.target # this disables UI
sudo systemctl set-default graphical.target # this enables UI

# other methods
sudo systemctl stop gdm
sudo systemctl stop lightdm
sudo telinit 3 # use 5 to bring it back

## On CentOS where systemctl is not supported
# edit /etc/inittab
id:3:initdefault:
```

<br/>

### Disable_wireless_on_startup

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

### Do_Mount_FileSystem

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

### Edit_Service_Command

most services has configs under:
- /etc/default/NAME
- /etc/init.d/NAME
- /etc/init/NAME.conf

<br/>

### Enable_Service_On_Startup

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

### Enable_ssh_on_new_Linux_machine

```sh
# install ssh
sudo apt-get install openssh-server
```

<br/>

### Enable_ssh_port_forwarding

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

### Enable_sshfs

```sh
mkdir /media/remote/fs/mountpoint
sshfs -o idmap=user username@hostname:/path/to/dir /media/remote/fs/mountpoint
# to unmount:
fusermount -u /media/remote/fs/mountpoint
```

<br/>

### Enable_static_ip_on_Linux_machine

```sh
# for Debian
route add default gw {ROUTER-IP-ADDRESS} {INTERFACE-NAME}
sudo ifconfig eth0 192.168.1.30 netmask 255.255.255.0
# add set this in /etc/network/interfaces file
# auto eth0 static ip on start up
iface eth0 inet static
    address 192.168.1.30
    network 192.168.1.0
    netmask 255.255.255.0
    broadcast 192.168.1.255
    gateway 192.168.1.1
    dns-nameservers 192.168.1.1

# for CentOS
# use a CLI GUI
nmtui edit eth0

# OR Do it yourself
# update /etc/sysconfig/network-scripts/ifcfg-eth0
# and make sure these fields are updated as follows
DEVICE=eth0
BOOTPROTO=none
ONBOOT=yes
PREFIX=24
IPADDR=192.168.100.5 # desired static IP
# EOF
# IF DOES NOT EXIST, here is a template
TYPE=Ethernet
BOOTPROTO=none
IPADDR=192.168.100.5 # Desired static server IP #
PREFIX=24 # Subnet #
GATEWAY=192.168.1.1 # Set default gateway IP #
DNS1=192.168.1.1 # Set dns servers #
DNS2=8.8.8.8
DNS3=8.8.4.4
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=no # Disable ipv6 #
NAME=eth0
UUID=41171a6f-bce1-44de-8a6e-cf5e782f8bd6 # created using 'uuidgen eth0' command #
DEVICE=eth0
ONBOOT=yes
# EOF
systemctl restart network # then do this

# alternatively, if above method didn't work
ip=<desired_static_ip>
dns=<router_dns_address>
ns=<name_server_address|8.8.8.8>
  # here router dns is usually the router admin portal address with 0 as the last of the four numbers, i.e. 192.168.1.0
sudo cat <<EOT >> /etc/dhcpcd.conf
interface eth0
static ip_address=$ip/24
static routers=$dns
static domain_name_servers=$dns
EOT
sudo reboot
```

<br/>

### Enable_Disable_Swap_Memory

```sh
sudo dphys-swapfile swapoff && \
sudo dphys-swapfile uninstall && \
sudo update-rc.d dphys-swapfile remove

# verify empty means disabled
sudo swapon --summary
```

### Entering_Rescue_Mode

```sh
# reboot the machine and at the grub boot menu, choose the correct Distro and press 'e'
# find the line 'linux' and add this at the end of the line
systemd.unit=rescue.target
# press Ctrl-X to write (emacs command)
```

### Entering_Grub_Rescue

```sh
# after updating the partition that touches the root filesystem, very likely
# you will stuck in Grub rescue mode
# do follow steps
ls
ls (hd0,msdosx) # or something like this from the above command
# until one shows something not 'Device Not Found'
set prefix=(hd0,msdos6)/boot/grub
insmod normal
normal

# after boot into the os successfully
sudo update-grub # which is the same as running 'grub-mkconfig -o /boot/grub/grub.cfg'
sudo grub-install /dev/sda # If the drive is hd0 the equivalent is sda, if it's hd1 then use sdb
# might need to replace the disk uuid with the newer one

# install grub 2
# http://ftp.gnu.org/gnu/grub/
```

<br/>

### Find_USB_Cam

```sh
sudo apt-get install v4l-utils
v4l2-ctl --list-devices
# view more info about this device
sudo v4l2-ctl --device=/dev/video0 --all
v4l2-ctl --list-formats-ext # show available resolution settings
ffmpeg -f v4l2 -list_formats all -i /dev/video0 # show supported resolutions
ffprobe <file> # check video resolution
```

<br/>

### Find_File_Structure_Difference

```sh
diff -qr dir-1/ dir-2
# alternatively, use a tool called meld
sudo apt-get install meld
```

<br/>

### Find_Device_Info

```sh
dmesg | egrep -i --color 'cdrom|dvd|cd/rw|writer'
```

<br/>

### Find_Search_Files

```sh
locate file # uses database search to find file names that match a given pattern

find /home/pi -mmin -3 -ls # give files changed in /home/pi in last 3 minutes
find /home/pi -name "*.bak" -exec rm {} ';' # find and remove files named like xxx.bak in /home/pi
find /home/pi -name "*.bak" -ok rm {} ';' # ask for permission before executing the rm command for each file
find / -ctime -3 # find files whose inode metadata (ownership, permissions) changed within last 3 days
find / -atime +3 # find files accessed earlier than 3 days before
find / -mtime 3 # find files modified/written exactly 3 days before
find / -size +10M # find files greater than 10 MB in size
```

<br/>

### Find_Packages_To_Install

```sh
# debian linux
sudo apt-get update && sudo apt-get upgrade
sudo apt-cache search <pkg>
sudo apt-get install <pkg>

# downgrade a package
sudo apt-cache showpkg <pkg> # list pkg versions
sudo aptitude install <pkg>=<version>

# pin a package version
sudo apt-mark hold <pkg>

# to install .deb file
sudo dpkg -i /path/to/deb/file
# alternatively
sudo apt install /path/to/deb/file
```

<br/>

### Find_My_IP_Address

```sh
# give private IP address
ifconfig # look for ethX or enX, physical connections
ip addr
hostname -I

# give public IP address via an echo server
curl https://checkip.amazonaws.com
curl https://icanhazip.com
```

<br/>

### Find_Other_Machines_On_Local_Network

```sh
sudo nmap -sA 192.168.1.0/24
```

### Fix_Slow_Mouse_Over_Bluetooth

```sh
# a common problem on Raspberry pi
# add this to the end of the single line in /boot/cmdline.txt (or update it if exists)
# the number can be 0-8, the lower the more frequently the mouse is polled
usbhid.mousepoll=0
```

<br/>

### Get_Date_Time_Formatted

```sh
date +%Y%m%d-%H # give format 20190718-02
date +%M # give format 15
```

<br/>

### Get_My_Ip_Address_On_the_Internet

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

### Install_Multi_Distro_Linux_On_A_Machine

```sh
# a good article explains all this, not going to put the steps here
# see https://www.garron.me/en/linux/dual-boot-two-linux-distributions-distros.html
# see reduce root fs size https://www.thegeekdiary.com/how-to-shrink-root-filesystem-on-centos-rhel-6/
```

<br/>

### Make_Time_Elapse_Video_With_Webcam

```sh
streamer -o 0000.jpeg -s 640x480 -j 100 -t 2000 -r 1
ffmpeg -framerate 1/5 -i img%04d.jpeg -c:v libx264 -r 30 -pix_fmt yuv420p out.mp4
ffmpeg -framerate 4 -i %04d.jpeg -c:v libx264 -pix_fmt yuv420p video.mp4
ffmpeg -f concat -safe 0 -i out%01d.mp4 -c copy combined.mp4
```
`-t` says how many frames(images) to record, `-r` says frames per second

<br/>

### Network_Settings

Usually stored in `/etc/NetworkManager/system-connections/NETGEAR-VPN.nmconnection` for Ubuntu
Might need root access to view
Network logs can be found in `/var/run/syslog`
service network restart

<br/>

### Open_A_Port_To_LAN

```sh
# use ufw on ubuntu
sudo ufw allow 3306
# to delete/remove the rule
sudo ufw delete allow 3306

# use iptables on other Linux flavors
sudo iptables -A INPUT -p tcp --dport 3306 -j ACCEPT
sudo iptables -A INPUT -p tcp --sport 3306 -j ACCEPT
# to delete/remove the rule
sudo iptables -D INPUT -p tcp --dport 3306 -j ACCEPT
sudo iptables -D INPUT -p tcp --sport 3306 -j ACCEPT
```

<br/>

### RaspberryPi

```sh
# RaspberryPi Configs (terminal and ssh friendly)
## default password is also changed this way instead of the passwd command
sudo raspi-config
```

<br/>

### Remote_Print_From_Terminal

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

### Resize_disk_partitions

```sh
fdisk -l # shows current partitions
fdisk <dev> # edit a drive's partitions
# use 'p' to see current partitions
# if the root is the last partition then follows the free space, then it is very easy
# use 'd' to delete the root partition, take note its start sector
# use 'n' to create the new partition, put in the start sector and leave the end sector as default
# use 'p' to make sure it looks right
# use 'w' to write out and reboot
resize2fs <dev-subpartition-name>

# might want to double check the soft links under /dev/disks/by-uuid
# if you messed with the dev labels by re-partitioning

# after performing re-partition it is likely to get stuck in grub recovery mode
# try the advice on the #Entering_Grub_Rescue section on this page
# or try the recovery steps from this post
# https://askubuntu.com/questions/119597/grub-rescue-error-unknown-filesystem
```

<br/>

### Setup_Cronjob

```sh
crontab -e
# Add an entry with the schedule string followed by the command
minute(0-59) hour(0-23) day(1-31) month(1-12) weekday(0-6) command
# Like this:
29 0 * * * /usr/bin/example
```

<br/>

### Setup_Reverse_Proxy

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

### View_Port_Binding

```sh
netstat -nlp # add -t if want TCP only
lsof -i TCP
ss -ap
```

<br/>

### View_Service_Logs

```sh
systemctl --state=failed
systemctl status <service-name>
service <service-name> status
journalctl -u <service-name> -b
```
