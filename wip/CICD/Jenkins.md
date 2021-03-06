---
layout: note_page
title: Jenkinsfile for pipeline
title_short: jenkinsfile_template
dateStr: 2019-08-04
category: Continuous-Delivery
tags: notes template check
---
This note shows only one template with brief explanations for the components of a jenkinsfile.

```
pipeline { # declarative pipeline
    agent { # exec in Jenkins env depending on where the agent section is placed
        docker {
            image 'node:7-alpine'
            label '' # A string. The label to run the Pipeline/individual stage
            args ''
        }
        # or
        dockerfile {
            filename 'Dockerfile.build'
            dir 'build'
            label 'my-defined-label'
            additionalBuildArgs  '--build-arg version=1.0.2'
        }
    }
    environment { # specifies a seq of key-vals defined as env vars for steps
        DISABLE_AUTH = 'true'
        DB_ENGINE    = 'sqlite'
    }
    options { # configuring Pipeline-specific options from w/n the Pipeline
        timeout(time: 1, unit: 'HOURS')
    }
    parameters { # vals for user-specfd params made avai to Pipeline steps
        string(name: 'PERSON', defaultValue: 'Jen', description: 'descript')
    }
    triggers { # automated ways in which the Pipeline should be re-triggered
        cron('H */4 * * 1-5')
    }
    tools { # defining tools to auto-install and put on the PATH
        maven 'apache-maven-3.0.1'
    }
    stages {
        stage('Build') { # bulk of the "work" described by a Pipeline located
            input { # prompt for input
                message "Should we continue?"
                ok "Yes, we should."
                submitter "alice,bob"
                parameters {
                    string(name: 'PER', defaultValue: 'Jen', description: '?')
                }
            }
            steps { # a series of steps to be executed in given stage directive
                sh 'echo "Hello World"'
                sh '''
                    echo "Multiline shell steps works too"
                    ls -lah
                '''
            }
        }
        stage('Deploy') {
            steps {
                retry(3) { # build-in conditions
                    sh './flakey-deploy.sh'
                }

                timeout(time: 3, unit: 'MINUTES') {
                    sh './health-check.sh'
                }

                timeout(time: 3, unit: 'MINUTES') {
                    retry(5) {
                        sh './flakey-deploy.sh'
                    }
                }
            }
        }
        stage('Test') {
            steps {
                sh 'echo "Fail!"; exit 1'
            }
        }
    }
    post { # def one+ steps run upon the completion of a Pipeline or stage
        always {
            echo 'This will always run'
            junit 'build/reports/**/*.xml' # save test reports
            archiveArtifacts artifacts: 'build/libs/**/*.jar', fingerprint: true
            # save the built artifact
        }
        success {
            echo 'This will run only if successful'
        }
        failure {
            echo 'This will run only if failed'
        }
        unstable {
            echo 'This will run only if the run was marked as unstable'
        }
        changed {
            echo 'This will run only if the state of the Pipeline has changed'
            echo 'For example, if the Pipeline was previously failing but now'
        }
    }
}

node { # scripted pipeline, using groovy language
    stage('Example') {
        if (env.BRANCH_NAME == 'master') {
            echo 'I only execute on the master branch'
        } else {
            echo 'I execute elsewhere'
        }
    }
}
```
