// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TraceCheckpoint {
    struct Checkpoint {
        address creator;
        bytes32 hash;
        uint256 timestamp;
        string projectId;
        string description;
        address[] collaborators;
        CheckpointType checkpointType;
    }
    
    enum CheckpointType {
        MANUAL,
        GIT_COMMIT,
        DEPLOYMENT,
        SCREENSHOT,
        COLLABORATION
    }
    
    struct Project {
        address owner;
        string name;
        string description;
        uint256 createdAt;
        bool isPublic;
        address[] collaborators;
    }
    
    mapping(bytes32 => Checkpoint) public checkpoints;
    mapping(string => bytes32[]) public projectCheckpoints;
    mapping(string => Project) public projects;
    mapping(address => string[]) public userProjects;
    
    event ProjectCreated(string indexed projectId, address owner, string name);
    event CheckpointCreated(bytes32 indexed hash, address creator, string projectId, CheckpointType checkpointType);
    event CollaboratorAdded(string projectId, address collaborator);
    
    modifier onlyProjectOwner(string memory projectId) {
        require(projects[projectId].owner == msg.sender, "Not owner");
        _;
    }
    
    modifier onlyCollaborator(string memory projectId) {
        Project memory project = projects[projectId];
        bool isCollaborator = project.owner == msg.sender;
        for (uint i = 0; i < project.collaborators.length; i++) {
            if (project.collaborators[i] == msg.sender) {
                isCollaborator = true;
                break;
            }
        }
        require(isCollaborator, "Not collaborator");
        _;
    }
    
    function createProject(
        string memory projectId,
        string memory name,
        string memory description,
        bool isPublic
    ) public {
        require(bytes(projects[projectId].name).length == 0, "Project exists");
        
        projects[projectId] = Project({
            owner: msg.sender,
            name: name,
            description: description,
            createdAt: block.timestamp,
            isPublic: isPublic,
            collaborators: new address[](0)
        });
        
        userProjects[msg.sender].push(projectId);
        
        emit ProjectCreated(projectId, msg.sender, name);
    }
    
    function createCheckpoint(
        bytes32 hash,
        string memory projectId,
        string memory description,
        address[] memory collaborators,
        CheckpointType checkpointType
    ) public onlyCollaborator(projectId) {
        checkpoints[hash] = Checkpoint({
            creator: msg.sender,
            hash: hash,
            timestamp: block.timestamp,
            projectId: projectId,
            description: description,
            collaborators: collaborators,
            checkpointType: checkpointType
        });
        
        projectCheckpoints[projectId].push(hash);
        
        emit CheckpointCreated(hash, msg.sender, projectId, checkpointType);
    }
    
    function addCollaborator(string memory projectId, address collaborator) 
        public 
        onlyProjectOwner(projectId) 
    {
        Project storage project = projects[projectId];
        project.collaborators.push(collaborator);
        emit CollaboratorAdded(projectId, collaborator);
    }
    
    function getCheckpoint(bytes32 hash) public view returns (Checkpoint memory) {
        return checkpoints[hash];
    }
    
    function getProjectCheckpoints(string memory projectId) 
        public 
        view 
        returns (bytes32[] memory) 
    {
        return projectCheckpoints[projectId];
    }
    
    function getUserProjects(address user) public view returns (string[] memory) {
        return userProjects[user];
    }
    
    function getProject(string memory projectId) public view returns (Project memory) {
        return projects[projectId];
    }
}
