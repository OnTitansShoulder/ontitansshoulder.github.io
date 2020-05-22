---
layout: note_page
title: Linux Accounts & Groups Management
title_short: linux_accounts_groups
dateStr: 2019-04-01
category: Linux
tags: notes reference check
---
This notes covers users accounts on Linux.

#### User Identification

**UID and GID**
Linux use UID to identify users. These information are stored in /etc/passwd.
Restrictions:

id range | feature
-------- | -------
`0` | system admin, or root. Other account UID could be changed to 0 to get root access but not recommended
`[1, 499]` | system account, reserved to system services, not useable by users to login
`[500, 2^23-1]` | for normal users

<br/>
Similar concept for GID, in `/etc/group`

Use `id` to check some user's UID GID and groups info. `id user_name`

**Linux Login process**
1. locate account in `/etc/passwd`, read UID and GID, as well as home directory and shell settings.
2. check password from `/etc/shadow` by looking up UID
3. password match, login success, control access granted

A line in `/etc/passwd` looks like `root:x:0:0:root:/root:/bin/bash` parts are:
1. Account name
2. Password. Not here anymore, in `/etc/shadow` instead
3. UID
4. GID
5. User info
6. home directory
7. shell

A line in `/etc/shadow` looks like `root:$1$/30QpE5e$y9N/D0bh6rAACBEz.hqo00:14126:0:99999:7:::` parts are:
1. Account name
2. Password (encrypted)
3. Recent changed date (in number of days from 1970/1/1)
4. Password unchangeable for N days
5. Password required changes in N days
6. Password change remainder N days before due
7. Password expiration tolerance in N days
8. Password expiration date (like 3)
9. reserved

`passwd` can change the password of current user.

When **forgot root password**
1. reboot and enter single-user maintenance mode, use `passwd` to change it.
2. boot from CD, mount `/root` and change `/etc/shadow`, delete the password part (next login root requires no password), then login to root use `passwd` to change it.

#### Groups

A line in `/etc/group` looks like `root:x:0:root` parts are:
1. Group name
2. Group password (not here anymore, in /etc/gshadow)
3. GID
4. All accounts that joined this group

**Effective group and Initial group**
- **initial group**: the group access given upon successful login. 4th column in /etc/passwd
- **effective group**: the group that is under effect now. It can be the group current user belongs to, user can own the group access of the file
- `groups` shows the groups this user belongs to
  - the first group output is the effective group
  - use `newgrp` to switch to other group as effective group (starts a new shell. Need to exit if wish to go back to previous shell)
- root can add a user into a group using `usermod`. It can also be done by the group admin using `gpasswd`

**A line in /etc/gshadow** looks like `root:::root` parts are:
1. Group name
2. Password
3. Group admin account
4. All accounts joined this group

This file's purpose is to add group admins for each group, for which group admin can help root add user to a group.

#### User management

**useradd** create a user
- `useradd [-u UID] [-g init_group] [-G secondary_group] [-mM] [-c notes] [-d home_dir_path] [-s shell_path] user_name`
- use `passwd user_name` to change password and add encryption
- the default values come from /etc/default/useradd, /etc/login.defs, and /etc/skel/*

**passwd**, **chage** can both edit user passwords

**usermod** can change existing account's info, like home directory, password expiration date, freeze account, etc.
- `usermod [-cdegGlsuLU] username`

**userdel** deletes user and all data associated with /etc/passwd, /etc/shadow, /etc/group, /etc/gshadow, etc.
- `userdel [-r] user_name` -r means delete home dir as well

**finger** lookup user related information.
- `finger [-s] user_name`
- use `finger` by it self will list current users logged in
- use **chfn** to add more info about a user: `chfn [-foph] user_name`

Forgot to add a home directory after creating a user? Follow this:
```sh
ll -d ~guest # make sure it is not there
cp -a /etc/skel /home/guest
chown -R guest:guest /home/guest
chmod 700 /home/guest
```

#### Group management

**groupadd** add a new group
- `groupadd [-g gid] [-r] group_name`
- `-r` setup system group

**groupmod** modify a group
- `groupmod [-g gid] [-n new_group_name] group_name`

**groupdel** delete a group
`groupdel group_name`

**gpasswd** to add a group admin or change a group's password
- `gpasswd [-A user1, ...] [-M user, ...] [-rR] group_name`
- `-A` (root) `-a` (group admin) give users admin privilege
- `-d` remove users from group admin
- `-M` add users to this group
- `-r` remove password
- `-R` invalidate group password

#### Linux ACL Privilege

ACL stands for Access Control List, applies to individual privileges on top of the traditional owner, group, others access rights.

AcCL supports access for single user for single file rwx setting.
More on Book P505.

#### sudo

`sudo` is a handy command to become root for only executing a command with root's privilege.

A user must be added to `/etc/sudoers` to be able to use `sudo`. The command to do so is `visudo`.
More on P512 on Book

#### Special shell

`/sbin/nologin` use this shell to limit the user account to not able to log onto the system shell.

i.e. when the user should have only the mail server access.

##### PAM (Pluggable Authentication Modules)

Many program uses PAM for password functions
Take an example as a call to `passwd`
1. user exec `/usr/bin/passwd`, and enter password
2.`passwd` calls PAM module for verification
3. PAM will check `/etc/pam.d` and look for passwd configuration
4. based on `/etc/pam.d/passwd`, use corresponding PAM module to verify
5. return result to `passwd`
6. `passwd` decide next action

`/etc/pam.d/passwd` What is inside the file:
```
auth include system-auth
account include system-auth
password include system-auth
(Type)  (Flag)  (Parameter)
```

_Type:_
- auth: authentication, check user identification
- account: authorization, check whether user has specific access
- session: what env setting available for this session
- password: change password

_Control-flag:_
- required: required check, on success/failure still proceed
- requisite: must be checked success to proceed, otherwise return failure
- sufficient: final checking step
- optional: mostly just showing information, not for checking
- include: call next word for verification `password include system-auth` means call `system-auth` instead

See on Book P521

PAM can set a disk quota for each user by changing `/etc/security/limits.conf`
```
user_name   soft    fsize   90000  # gives warning when reach this much, in KB
user_name   hard    fsize   100000 # cannot exceed this
@group_name soft    fsize   100000 # limit for groups
```
use `ulimit` can check usage limits, `ulimit -a`

**login error logs**

`/var/log/secure` and `/var/log/messages` contains logs for users logging into this machine

**look up usage of a user**

`w` and `who` shows users currently logged in

`lastlog` shows last login time for each user

**message or broadcast**

`write <user_name>` will directly display a message to that user
`mesg n` to disable receiving, `mesg y` to enable
`wall "broadcast: message"` to let a message show for all users

**mail**

use `mail` to receive/send mails in Linux
```sh
mail username@host -s "subject"
Hello nice to meet you.
Bye!
. # this dot must be there to finish the draft
```
you can write email in a file first then `mail user -s "subject" < filename`
