// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 constant alphay  = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 constant betax1  = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 constant betax2  = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 constant betay1  = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 constant betay2  = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 4731424442858137098254259873087980079977640778855785017363826299142735803186;
    uint256 constant deltax2 = 844739214971099977390041558676770346720145438830376373027462374142067615860;
    uint256 constant deltay1 = 16384954803272245065001185025656023537415330111534311990909902408502158775146;
    uint256 constant deltay2 = 7010056520041353784378709388940384512302778544155269078715780838180159610803;

    
    uint256 constant IC0x = 11490645370182258322547489760594378654833410411246440788295853127703751684663;
    uint256 constant IC0y = 21390561206317773730375347934709942969788319222570754322692500253893621451054;
    
    uint256 constant IC1x = 14735082472787879339780249198755661022629206001537269782883151423375132782922;
    uint256 constant IC1y = 5184119250924075039780423583516059569194633627572339939314912282479108287752;
    
    uint256 constant IC2x = 4966459891586642946441476433375107301297176202921881012219469588533913495273;
    uint256 constant IC2y = 804658011116921664576829864642695939652262329258637536296813888939649294231;
    
    uint256 constant IC3x = 16328249859928921869764833026411385513092268538143997354057050078186006287499;
    uint256 constant IC3y = 16008713188220857865777397986209022560053811572214973055688340982958622778028;
    
    uint256 constant IC4x = 14684951168964209853389951363812498859202490943453418103626882358949097231056;
    uint256 constant IC4y = 6085428572776782400109480280455761782776035188640361472094586019561490058884;
    
    uint256 constant IC5x = 17921523530707524545911612589451845289198066434682976007854297666801836839032;
    uint256 constant IC5y = 10840860389425664516916476390715405753899633219771685516207354271275901905641;
    
    uint256 constant IC6x = 2651922437606262278288662794114156953019226884593946162003906613256020114309;
    uint256 constant IC6y = 740440590310759289321748478863100287327373150516410854499373488513665688109;
    
    uint256 constant IC7x = 1037584535748193429797829336431653914635295311715532760652511032940307548357;
    uint256 constant IC7y = 3380373524564282556629937538652731291415208026260890096359447401939106611737;
    
    uint256 constant IC8x = 10974945142115068750525262607610509144509792173930938975735767726485875429570;
    uint256 constant IC8y = 13388642274694922918691841268406692452836505622484246499491305038811306029618;
    
    uint256 constant IC9x = 18280570816625943851212823896456739061002932916228380628970944676119983901041;
    uint256 constant IC9y = 1542582223093481975971507501910853662915925104280839075594053519270725629193;
    
    uint256 constant IC10x = 18316856924498530541446700768189403741611816350512735639917416629098409946013;
    uint256 constant IC10y = 20512762693752078182473064254580626398753720360775768230328838876719948117193;
    
    uint256 constant IC11x = 16939661380656840914852658214855752416268868710348817865439279980175211736534;
    uint256 constant IC11y = 5034822376853503458098280774161290234596495706553579945514647600013899654829;
    
    uint256 constant IC12x = 13532754105630516810864249614833582377720250166533135821997746870069914330453;
    uint256 constant IC12y = 5022671848122036204217453170739480996381733437034343009199305320784921092146;
    
    uint256 constant IC13x = 20721280041077950874815741646805155963500567480586205308417099794583472731527;
    uint256 constant IC13y = 13064962087598978633380800359170509050758248406419844122075256310087224923495;
    
    uint256 constant IC14x = 3685662095125310696251211080267986651217398685856747597150262817996322891020;
    uint256 constant IC14y = 1622803044446842850467020798702692149210272716879748761749995896639010341738;
    
    uint256 constant IC15x = 21335323761108883025560941756799979616588217727794974501267754192344667570315;
    uint256 constant IC15y = 1858478801993883659538000952146063357325250248268883188195571336042118804551;
    
    uint256 constant IC16x = 3146521050948449500945795908167466740879183515345598316220647427999825701814;
    uint256 constant IC16y = 15671215309289068312072025689849094418321225548059570332276830768131843881266;
    
    uint256 constant IC17x = 9248633015695618136091977945889126242583249506225108773819494068869307441505;
    uint256 constant IC17y = 3029242698264758934451863000051260425975215859053103582425497658121821017857;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[17] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                
                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))
                
                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))
                
                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))
                
                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))
                
                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))
                
                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))
                
                g1_mulAccC(_pVk, IC17x, IC17y, calldataload(add(pubSignals, 512)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            
            checkField(calldataload(add(_pubSignals, 352)))
            
            checkField(calldataload(add(_pubSignals, 384)))
            
            checkField(calldataload(add(_pubSignals, 416)))
            
            checkField(calldataload(add(_pubSignals, 448)))
            
            checkField(calldataload(add(_pubSignals, 480)))
            
            checkField(calldataload(add(_pubSignals, 512)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
