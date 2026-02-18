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
    uint256 constant deltax1 = 3412791691026366356574561938801801023743590353312677798104431558725430308604;
    uint256 constant deltax2 = 7998296213065914504035409227715357467565476450243600753083476842697529893979;
    uint256 constant deltay1 = 5616517210628845056161174379632304916776400762938029453127563961233304753753;
    uint256 constant deltay2 = 14630641529037210301107620933039544904297260519952926482698955819509207736050;

    
    uint256 constant IC0x = 11313588289660444615637249136482056887474812816185986585536614249160021059939;
    uint256 constant IC0y = 10946286511247357757119276419216860307866674209662111547989511628110530026156;
    
    uint256 constant IC1x = 4186059616122109004517695338264031636175776210228942690537008723880662609315;
    uint256 constant IC1y = 20507284780537936069768864047387559600006923363659197325499673560978211119455;
    
    uint256 constant IC2x = 12203195410459729631963477643343605656661787252526003477732172172386799700663;
    uint256 constant IC2y = 19375792044523949726369613749986466295620585190690459970445871494100714239537;
    
    uint256 constant IC3x = 16143953259377729589030763751809780191100148425604267765246177092102914040593;
    uint256 constant IC3y = 892156143028807945408566349789437195844457828016232845947202088592627700752;
    
    uint256 constant IC4x = 11020928394377009012651182816747765816392247479143560355032354513948186847346;
    uint256 constant IC4y = 18429215126768939666740192013926466158914047399777565483348604525582768665254;
    
    uint256 constant IC5x = 13171504447180480548440343281513886892480451733930741390424708237230462602539;
    uint256 constant IC5y = 12092031553280295380296540461287576885840747621211526531890631769059492161110;
    
    uint256 constant IC6x = 15272653932684782045444440627818669339782919835497019537692488862479231837505;
    uint256 constant IC6y = 1882036554697432660372178042326842311059744044582901321986268644707471931409;
    
    uint256 constant IC7x = 17425744576047318997562839222064722341374632771507038851383169830934480235294;
    uint256 constant IC7y = 9108845786062180680199026835190942522220484146844542030754769702560524113263;
    
    uint256 constant IC8x = 1625209280914153359362587332147065001574460667440569323965350825467942128307;
    uint256 constant IC8y = 2794079026655803190577023576743990532958833484639631207226802970865396666889;
    
    uint256 constant IC9x = 10240664279683918538583203616644590373835888230811172889833051311578171979661;
    uint256 constant IC9y = 11527587660364099037046110769673188471757497627179303082624986757592984219292;
    
    uint256 constant IC10x = 2187077326358471955025407087522752465089433419423576009907738762697409639710;
    uint256 constant IC10y = 16036285645595271002078301429727772518690020141600785553015437414843515737689;
    
    uint256 constant IC11x = 500388216951925594675206354022014511310496700779095337677392155211892525707;
    uint256 constant IC11y = 159146667603627143078672739034738467670771866883275239198785666242261161633;
    
    uint256 constant IC12x = 9395161868481248647460316983661653938966801617469656348973388135493908944540;
    uint256 constant IC12y = 5311938834727246092337289735157680737074701322910716987023489132793145378865;
    
    uint256 constant IC13x = 18005607318653188698912998997862098242059459042577125847161053357499611507945;
    uint256 constant IC13y = 15523454514021357953639342521341924475357187244503218805939401957169577777259;
    
    uint256 constant IC14x = 12493993544757070950268672784952158643523800342942563656200072502462731964838;
    uint256 constant IC14y = 687251312674567363559472041644385299774359963509936332523059862280534605369;
    
    uint256 constant IC15x = 3883447629038612594781799001841934023318612777826485659809660398374233777406;
    uint256 constant IC15y = 13121460089804137791635109980282377904668047691265487362998307368755695128110;
    
    uint256 constant IC16x = 3657210520872017054330790720837000565910285396395153431290737679056654134890;
    uint256 constant IC16y = 11404486403071022959139770400657319263039840999256428225763614727547530729106;
    
    uint256 constant IC17x = 4293308945154970605569093264301368619612671313235799560843477999356669443520;
    uint256 constant IC17y = 7390710587949098832189812115417752032163847540622582435547846282849424493218;
    
 
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
