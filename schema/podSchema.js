{
  "$schema": "http://json-schema.org/draft-03/schema",
  "type": "object",
  "required": false,
  "description": "Pod resource. A pod corresponds to a co-located group of [Docker containers](http://docker.io).",
  "properties": {
    "kind": {
      "type": "string",
      "required": false
    },
    "id": {
      "type": "string",
      "required": false
    },
    "creationTimestamp": {
      "type": "string",
      "required": false
    },
    "selfLink": {
      "type": "string",
      "required": false
    },
    "desiredState": {
      "type": "object",
      "required": false,
      "description": "The desired configuration of the pod",
      "properties": {
        "manifest": {
          "type": "object",
          "required": false,
          "description": "Manifest describing group of [Docker containers](http://docker.io); compatible with format used by [Google Cloud Platform's container-vm images](https://developers.google.com/compute/docs/containers)"
        },
        "status": {
          "type": "string",
          "required": false,
          "description": ""
        },
        "host": {
          "type": "string",
          "required": false,
          "description": ""
        },
        "hostIP": {
          "type": "string",
          "required": false,
          "description": ""
        },
        "info": {
          "type": "string",
          "required": false,
          "description": ""
        }
      }
    },
    "currentState": {
      "type": "object",
      "required": false,
      "description": "The current configuration and status of the pod. Fields in common with desiredState have the same meaning.",
      "properties": {
        "manifest": {
          "type": "object",
          "required": false
        },
        "status": {
          "type": "string",
          "required": false
        },
        "host": {
          "type": "string",
          "required": false
        },
        "hostIP": {
          "type": "string",
          "required": false
        },
        "info": {
          "type": "object",
          "required": false
        }
      }
    },
    "labels": {
      "type": "object",
      "required": false
    }
  }
}
