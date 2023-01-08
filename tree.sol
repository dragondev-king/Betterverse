
// File: Trees.sol


pragma solidity >= 0.8.7 < 0.9.0;
a faf abiaf afe


interface IVRF {

    function requestRandomWords(uint256 token, address nft, uint256 value)external returns(uint256);

}

contract BetterTree is  ReentrancyGuard, ERC721Enumerable, Ownable{

    using Counters for Counters.Counter;
    using Address for address;   

    event fertiliserAdded(uint256 indexed token, uint256 bags);
    event minted(uint256 indexed token, address indexed user);
    event pollinationChanged(address indexed pollination);
    event valueAdded(uint256 indexed token, uint256 newValue);
    event randomReturned(uint256 indexed tokenId, uint8 rarityCat);

    address public pollinator;
    address public minter;
    address public vrf = 0x42e36c2a53180e62E7fe8CF8F3cCa0b6C9cc8e26;//mumbai network

    string baseExtension = ".json";

    uint256 constant calculator = 3 weeks;

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _storedTreesCounter;

    Tree[] private _storedTrees;
    uint256[4] private _storedTreesCount;    
    mapping(uint8 => uint256[]) private _rarityToTreeIndex; 

    mapping(uint256 => uint256) private treeToTokenId;
    mapping(uint256 => TokenData) public tokenInfo;

    string[] public _batchCID;
    uint8[] public batchCat;

    uint256 private waiting;

    struct Tree{

        uint256 batchID;
        uint256 jsonId;
        uint8 rarity;
    }

    struct TokenData{
        uint256 treeID;
        uint16 causeID;
        uint256 treeValue;
        uint256 planted;//I.E. bought at block...
        uint256 fertiliser; 
        bool burned;
    }

    constructor() ERC721("Betterverse: Tree Season One", "BVT"){

       _storedTrees.push(Tree(0,2376,0)); //default metadata;
       _batchCID.push("https://bafybeigjtusph7djrp7sxqyxj45zbc72eg5lxaiw3mehnbv455nbexaqwq.ipfs.nftstorage.link/"); //default tree holder
       _storedTreesCounter.increment();
       _tokenIdCounter.increment();
       batchCat.push(0);

    }

    modifier isMinter(){
        require(msg.sender == minter, "Non-minter");
        _;
    }

    /**
    * @dev owner function to add a new minting contract
    */
    function addMinter(address _minter)external onlyOwner{
        minter = _minter;
    }

    /**
     * @dev function is used to view chain data
     * @param _tokenId is the token being viewed
     */
    function dataReturn(uint256 _tokenId)external view returns(uint16, uint256, uint8, uint8){
        TokenData memory a = tokenInfo[_tokenId];
        return(a.causeID, a.treeValue, _storedTrees[a.treeID].rarity, _growthStage(_tokenId));
    }

    /**
     * @dev mint trees
     * @param _numberToMint mint count needs to between 1 and 10
     * @param _cause passes in the cause ID
     * @param _user send trees here
     * @param _treeValue value per tree
     */
    function mint(uint8 _numberToMint, uint16 _cause, uint256 _treeValue, address _user)external isMinter{
        
        require(treesInStorage() >= _numberToMint, "Error: Tree shortage");

        for(uint8 i =0; i < _numberToMint; i++){
            _minting(_user, _cause, _treeValue);
        }
        waiting += _numberToMint;
    }
    
    /**
    * @dev functions calculates how many trees instorage
    * @return uint256 the number of trees that can be minted.
    */
    function treesInStorage()public view returns(uint256){
        uint256 sum = _storedTreesCount[0]+_storedTreesCount[1]+_storedTreesCount[2];
        if(sum > waiting){
            return sum - waiting;
        }
        return 0;
    }
    
    /**
    * @dev internal minting function
    * @param _user the wallet receiving the token
    * @param _cause index of cause
    * @param _treeValue the treeValue
    */
    function _minting(address _user,  uint16 _cause, uint256 _treeValue)internal{
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(_user, tokenId);
            setInitialTree(tokenId, _cause, _treeValue, block.timestamp);
            address a = address(this);
            IVRF(vrf).requestRandomWords(tokenId, a, _treeValue);

            emit minted(tokenId, _user);
    }

    /**
    * @dev function to setTree caller is VRF
    * @param tokenId token to set
    * @param rarity rarity returned from vrf
    * @param random number to select the stored trees with
    */
    function setTree(uint256 tokenId, uint8 rarity, uint256 random)external{
        require(msg.sender == vrf, "Not VRF");
        uint8 r = rarity;
        
        if(_storedTreesCount[r] == 0){
           r = (rarity+1)%3;
           if(_storedTreesCount[r] == 0){
            r = (rarity+2)%3;
           } 
        }
        internalTreeSelection(tokenId, r, random);
        waiting -=1;

        emit randomReturned(tokenId, r);
        
    }
    /**
    * @dev internal fucntion to have tree selection
    * @param tokenId token being selected
    * @param r rarity
    * @param random number to select tree
    */
    function internalTreeSelection(uint256 tokenId, uint8 r, uint256 random)internal{
        uint256 count =  _storedTreesCount[r];
        uint256 a = random % count;
        uint256 treeId = _rarityToTreeIndex[r][a];
        tokenInfo[tokenId].treeID = treeId;

        _rarityToTreeIndex[r][a] = _rarityToTreeIndex[r][count-1];
        _rarityToTreeIndex[r].pop();
        _storedTreesCount[r] -=1;
    }

    /**
    * @dev owner minting function minting from index 3
    * @param count number to mint
    * @param user wallet receiving the tree
    * @param cause inex of cause supporting
    * @param value of the trees
    */
    function adminMint(uint8 count, address[] memory user, uint16 cause, uint256 value, uint8[] memory rarity)external onlyOwner{
            
        require( count <= _storedTreesCount[3], "Error: Not enough for mint");
        require(count == uint8(rarity.length) && uint8(user.length) == count);
        uint8 r = 3;
        uint256 time = block.timestamp;
        for(uint8 i =0; i<count; i++){
            require(rarity[i] <4 && rarity[i] >0);
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(user[i], tokenId);
            setInitialTree(tokenId, cause, value, time);
            internalTreeSelection(tokenId, r, 0);
            _storedTrees[tokenInfo[tokenId].treeID].rarity = rarity[i];               
        
            emit minted(tokenId, user[i]);
        }
    }
    
    function checkAdminTree()external onlyOwner view returns(uint256[] memory){
        return _rarityToTreeIndex[3];
    }

    /**
     * @dev function used to set variables for the tokenInfo
     * @param _cause index
     * @param _treeValue value of tree
     * @param _time time palanted
     */

    function setInitialTree(uint256 _tokenId, uint16 _cause, uint256 _treeValue, uint256 _time) internal{
        TokenData storage t = tokenInfo[_tokenId];
        t.treeID =  0;
        t.causeID = _cause;
        t.treeValue = _treeValue;
        t.planted = _time;
        t.fertiliser = 0;
        t.burned = false;
    }

    /**
     * @dev function determines what stage of growth index 0-4 it is in
     * @param _tokenId the tokenId
     * @return uint8 the stage of growth
     */
    function _growthStage(uint256 _tokenId)internal view returns(uint8){

        uint256 difference = block.timestamp - tokenInfo[_tokenId].planted;
        uint256 bonus = (difference * tokenInfo[_tokenId].fertiliser) / 10; 
        uint256 stage = (difference + bonus)/calculator;
        if(stage >= 4){
            return 4;
        }
        return uint8(stage);
    }

    /**
     * @dev function to burn tree
     * @param _tokenId token to burn
     * @param _reqGrowth the req to burn index + 1 
     * @return bool returns true if burned
     * @dev function can be called any approved address and burn tree as long as it's above the sent _reqgrowth
     */
    function burn(uint256 _tokenId, uint8 _reqGrowth)public nonReentrant returns(bool){
        require(_growthStage(_tokenId) + 1 >= _reqGrowth, "Error: Tree too young");
        require(_isApprovedOrOwner(msg.sender, _tokenId), "ERC721: transfer caller is not owner nor approved");
        tokenInfo[_tokenId].burned = true;
        _burn(_tokenId);

        return true;
    }

    /**
     * @dev function to add fertiliser to a token
     * @param _amount the amount of bags to buy
     * @param _tokenId the token to receive the bags
     */

    function fertilise(uint256 _amount, uint256 _tokenId) public isMinter{
        
        require(_exists(_tokenId), "Error: Token does not exist.");
        tokenInfo[_tokenId].fertiliser += _amount;

        emit fertiliserAdded(_tokenId, _amount);
    }

    /**
     * @dev function used to change the pollination contract
     * @param _addy new pollination contract
     */

    function pollinationAddy(address _addy)external onlyOwner{

        pollinator = _addy;

        emit pollinationChanged(pollinator);

    }

    modifier isPollen(){

        require(msg.sender == pollinator, "Error: Pollinators only");
        _;

    }

    /*
     * @dev function used by pollination contract
     * @param user individual to receive the new tree
     */

    function pollination(address _user)external isPollen nonReentrant{

        require(treesInStorage() >= 1, "Error: Tree shortage");
        _minting(_user, 0, 0);
        waiting +=1;
    }

    /**
     * @dev owner function to add new batch of Tree objects
     * @param batchID the batch the CID belongs to
     * @param jsonId the json id for the tree i.e. 1,2,3,4,5,6,7...n
     */

    function addTree(uint256 batchID, uint256[] memory jsonId)external onlyOwner{
        uint256 a = jsonId.length;
        require(batchID <  _batchCID.length, "Batch Does not exist");
        require(a > 0, "Error json array empty");
        uint8 r = batchCat[batchID];
        for(uint16 i =0; i<a; i++){
            _storedTrees.push(Tree(batchID, jsonId[i],r+1));
            _rarityToTreeIndex[r].push(_storedTreesCounter.current());
            _storedTreesCounter.increment();
        }
        _storedTreesCount[r] +=a;
    }
    
    function setBatchCID(string memory _newBatchCID, uint8 rarityCat) public onlyOwner returns(uint256) {
        _batchCID.push(_newBatchCID);
        batchCat.push(rarityCat);
        return _batchCID.length -1;
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override(ERC721) {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override(ERC721) {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override(ERC721) {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }

    // Overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override( ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override( ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }


    function tokenURI(uint256 _tokenId)public view override(ERC721) returns (string memory){

        require(_exists(_tokenId), "DNE");
        TokenData memory a = tokenInfo[_tokenId];
        Tree memory b = _storedTrees[a.treeID];
        uint8 c = _growthStage(_tokenId);
        string memory d;
        if(c==0){d="a";}
        if(c==1){d="b";}
        if(c==2){d="c";}
        if(c==3){d="d";}
        if(c>=4){d="e";}

        return string(abi.encodePacked(_batchCID[b.batchID], Strings.toString(b.jsonId), d, baseExtension));
    } 
    
    /**
    * @dev minter function to increase the valule of a tree
    * @param _amount increase to tree value
    * @param _tokenId token to increase
    * @param _causeId the cause index
    */
    function addValue(uint256 _amount, uint256 _tokenId, uint16 _causeId)public isMinter{
        require(_exists(_tokenId), "Token Does Not exist.");
        TokenData storage a = tokenInfo[_tokenId];
        if(a.causeID==0){
            a.causeID=_causeId;
        }
        a.treeValue += _amount;
        emit valueAdded(_tokenId, a.treeValue);
    }
}