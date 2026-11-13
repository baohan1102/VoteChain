
 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.24;

 contract VoteChain {
     // Tong so cuoc binh chon
     uint256 public pollCount;

     // Thong tin cua mot cuoc binh chon
     struct Poll {
         string title;
         string description;
         uint256 startTime;
         uint256 endTime;
         address creator;
         uint256 totalVotes;
     }

     // Luu thong tin cac cuoc binh chon theo ID
     mapping(uint256 => Poll) public polls;

     // Luu danh sach lua chon cua moi cuoc binh chon
     mapping(uint256 => string[]) private pollOptions;

     // Luu so phieu cho tung lua chon
     mapping(uint256 => mapping(uint256 => uint256))
         public voteCounts;

     // Kiem tra vi da bo phieu hay chua
     mapping(uint256 => mapping(address => bool))
         public hasVoted;

     // Danh sach vi duoc phep bo phieu
     mapping(uint256 => mapping(address => bool))
         public allowedVoters;
    
    // Su kien khi tao cuoc binh chon thanh cong
    event PollCreated(
        uint256 indexed pollId,
        address indexed creator,
        string title
    );

    // Tao cuoc binh chon moi
    function createPoll(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _startTime,
        uint256 _endTime
    ) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_options.length >= 2, "At least 2 options required");
        require(_startTime < _endTime, "Invalid time range");
        require(_endTime > block.timestamp, "End time must be future");

        // Tang ID cuoc binh chon
        pollCount++;

        // Luu thong tin cuoc binh chon
        polls[pollCount] = Poll({
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            creator: msg.sender,
            totalVotes: 0
        });

        // Luu danh sach lua chon
        pollOptions[pollCount] = _options;

        emit PollCreated(pollCount, msg.sender, _title);
    }
     
    // Su kien khi cap quyen bo phieu
    event VoterAdded(
        uint256 indexed pollId,
        address indexed voter
    );

    // Cap quyen bo phieu cho mot vi
    function addVoter(
        uint256 _pollId,
        address _voter
    ) public {
        require(
            _pollId > 0 && _pollId <= pollCount,
            "Poll does not exist"
        );

        require(
            msg.sender == polls[_pollId].creator,
            "Only creator can add voters"
        );

        require(
            _voter != address(0),
            "Invalid voter address"
        );

        require(
            !allowedVoters[_pollId][_voter],
            "Voter already added"
        );

        allowedVoters[_pollId][_voter] = true;

        emit VoterAdded(_pollId, _voter);
    }


    // Su kien khi bo phieu thanh cong
    event VoteCast(
        uint256 indexed pollId,
        address indexed voter,
        uint256 optionId
    );

    // Ham bo phieu
    function vote(
        uint256 _pollId,
        uint256 _optionId
    ) public {
        require(
            _pollId > 0 && _pollId <= pollCount,
            "Poll does not exist"
        );

        Poll storage poll = polls[_pollId];

        require(
            block.timestamp >= poll.startTime,
            "Poll has not started"
        );

        require(
            block.timestamp <= poll.endTime,
            "Poll has ended"
        );

        require(
            allowedVoters[_pollId][msg.sender],
            "You are not allowed to vote"
        );

        require(
            !hasVoted[_pollId][msg.sender],
            "You have already voted"
        );

        require(
   _optionId < pollOptions[_pollId].length,
    "Invalid option"
);

        hasVoted[_pollId][msg.sender] = true;

        voteCounts[_pollId][_optionId]++;

        poll.totalVotes++;

        emit VoteCast(_pollId, msg.sender, _optionId);
    }


    // Lay ket qua cua mot cuoc binh chon
    function getResults(uint256 _pollId)
        public
        view
        returns (
            string[] memory options,
            uint256[] memory counts
        )
    {
        require(
            _pollId > 0 && _pollId <= pollCount,
            "Poll does not exist"
        );

        options = pollOptions[_pollId];
        counts = new uint256[](options.length);

        for (uint256 i = 0; i < options.length; i++) {
            counts[i] = voteCounts[_pollId][i];
        }
    }

 }
   