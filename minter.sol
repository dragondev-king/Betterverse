
// File: minter.sol


pragma solidity >=0.8.7 < 0.9.0;

contract Minter is ReentrancyGuard, Ownable{

    using Address for address;   
    using SafeERC20 for IERC20;

    event addressChange(address reserveChange);
    event tokenAdded(address indexed erc20, uint256 value);
    event RemovedToken(address indexed erc20);

    address public reserve;
    address public nftContract;

    ICauses public immutable cause;
    ITree public immutable tree;

    UsableTokens[] public tokens;

    mapping(address => bool) approvedToken;
    mapping(address => uint256) tokenLocation;

    struct UsableTokens{
        address token; //erc20 token
        uint256 treeCost; //amount of erc20 token to buy a tree
        uint256 fertiliserValue; //amount of erc20 token to buy fertilser
    }

    constructor(){
        tree = ITree(0xd046fCFF9aDa0d05E9BaAaC4a851Ec1BE21C9AA7); 
        cause = ICauses(0x9443a5D24cDafbD2EECc0F254902a45531475ba0);
        reserve = msg.sender;
        tokens.push();
    }

    /**
    * @dev function used to add a new token to buy trees
    * @param _token erc20 token address
    * @param _treeCost the number of tokens required to mint a tree    
    */
    function addToken(address _token, uint256 _treeCost)external onlyOwner{
        require(_treeCost >0, "Error: Token amount 0");
        require(!approvedToken[_token], "Error: Token Accepted");
        uint fert = _treeCost/4; //Fertiliser cost 25% of what the tree cost
        require(fert >0, "Error: Token amount 0");
        UsableTokens memory a = UsableTokens(_token, _treeCost, fert);
        tokenLocation[_token] = tokens.length;
        approvedToken[_token] =true;
        tokens.push(a);

        emit tokenAdded(_token, _treeCost);
    }

    /**
     * @dev function to remove accept token to mint
     * @param _token erc20 to be removed
     */
    function removeToken(address _token)external onlyOwner{

        require(tokenToUse( _token), "Error: Token Does not match");

        uint256 loc = tokenLocation[_token];
        approvedToken[_token] =false;
        uint256 len = tokens.length-1;
        UsableTokens memory b = tokens[len];
        tokens[loc] = b;
        tokenLocation[b.token] = loc;
        tokens.pop();

        emit RemovedToken(_token);
    }

    /**
     * @dev function used to determine if token can be used
     * @return bool can token be used
     */
    function tokenToUse(address _token)internal view returns(bool){
        return approvedToken[_token] && tokens[tokenLocation[_token]].token == _token;
    }
    
    /**
     * @dev Owner function to set reserve
     * @param _reserve new reserve address
     */
    function setAddress(address _reserve) external onlyOwner{
        reserve = _reserve;
        emit addressChange(reserve);
    }
    
    /**
    * @dev function to mintTree
    * @param _numberToMint the number of trees to mint
    * @param _cause causeIndex
    * @param _valueToSpend the amount of tokens to spend
    * @param _token Token to use
    */
    function mintTree(uint8 _numberToMint, uint16 _cause, uint256 _valueToSpend, address _token) external nonReentrant{

        address user = msg.sender;
        
        UsableTokens memory a = tokens[tokenLocation[_token]];
        require(_numberToMint<=10 && _numberToMint > 0, "Error: Bounds 1->10");
        require(_valueToSpend >= a.treeCost * _numberToMint, "Error: Does not meet minium requirements");
        uint256 treeValue = (10 * (_valueToSpend/_numberToMint))/ a.treeCost;        
        (bool b, address c) = cause.causeDataCall(_cause);
        require(b, "Error: Cause DNE");
        internalTokenTransfer(_token, _valueToSpend, c, user, _cause);

        tree.mint(_numberToMint, _cause, treeValue, user);
        
    }
    
    /**
    * @dev function to fertilise the tree
    * @param _amount the amount of fertiliser to purchase
    * @param _tokenId the tree to fertilise
    * @param _token the erc20 token to spend
    */
    function fertiliseTree(uint256 _amount, uint256 _tokenId, address _token)public nonReentrant{
        address user= msg.sender;
        (uint16 cId,,) = tree.dataReturn(_tokenId);
        (,address cA) = cause.causeDataCall(cId);
        
        UsableTokens memory a = tokens[tokenLocation[_token]];
        uint256 toSpend = (_amount * a.fertiliserValue)/10;
        internalTokenTransfer(_token, toSpend, cA, user, cId);     

        tree.fertilise(_amount, _tokenId);

    }
    /**
    * @dev function to add Value to a tree
    * @param _token the erc20 token to spend
    * @param _amount the amount of tokens to spend
    * @param _tokenId the tree to increase value of
    * @param _causeID the index of the cause
    */
    function addTreeValue(address _token, uint256 _amount, uint256 _tokenId, uint16 _causeID)public nonReentrant{

        address user = msg.sender;
        UsableTokens memory a = tokens[tokenLocation[_token]];
        uint256 addValueTo = (10 *_amount) / a.treeCost;
        (uint16 b,,) = tree.dataReturn(_tokenId);
        if(b == 0){b = _causeID;}
        (,address _cause) = cause.causeDataCall(b);
        internalTokenTransfer(_token, _amount, _cause, user, b);

        tree.addValue(addValueTo, _tokenId, b);
    }
    
    /**
    * @dev used by other functions to send tokens
    * @param _token erc20 token to use
    * @param amount Total tokens spending
    * @param _cause address
    * @param user individual spending
    * @param index cause index
    */
    
    function internalTokenTransfer(address _token, uint256 amount, address _cause, address user, uint16 index)internal{
        require(tokenToUse(_token), "Error: Token not approved.");
        IERC20 token = IERC20(_token);
        require(token.balanceOf(user)>= amount, "Error: Insufficient Funds");
        uint256 base = amount/denom;
        uint256 causeA = base*num;
        token.safeTransferFrom(user, _cause, causeA);
        token.safeTransferFrom(user, reserve, base);
        cause.contractSentToCause(index, _token, causeA);        
        
    }
    uint8 denom = 10;
    uint8 num = 9;
    
    function changePercentage(uint8 _denom, uint8 _num)external onlyOwner{
        require(num <= denom);
        denom =_denom;
        num = _num;
    }
    
}