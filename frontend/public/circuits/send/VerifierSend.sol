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
    uint256 constant deltax1 = 19164509887305189242046569083516082714300365911892272863023545294936252415699;
    uint256 constant deltax2 = 19973133755427667735174251332788597034913094348497251491066502053958595939680;
    uint256 constant deltay1 = 21194280329579714262548740028137719349828458924256528515327738414476210736152;
    uint256 constant deltay2 = 12398106318434354478980584672842826261177988879648124415889961519177291159724;

    
    uint256 constant IC0x = 14349171501409368769908674908421225552253808622235438733415205027147718106975;
    uint256 constant IC0y = 11439313076810506337425290236094529597907108674577252354329695664740149049489;
    
    uint256 constant IC1x = 9193766309290011990459298109127107447888943515886984941488141603620857103562;
    uint256 constant IC1y = 8874573663313901563308220969199410207099733924298974873395973291571833032696;
    
    uint256 constant IC2x = 12692945454945090512009034972782355216081684086298524853011518164376864855983;
    uint256 constant IC2y = 9903282320119839348735062465017110079258476393244702766497883630134684736039;
    
    uint256 constant IC3x = 18107694262413563914610354212365560666362711184931953770198483441978268812980;
    uint256 constant IC3y = 4476007591246138716821391797368886838298444345376285409262191836598497166105;
    
    uint256 constant IC4x = 5070834641458669064101321259352100264552884106819555641435371163974869797302;
    uint256 constant IC4y = 13685971698374882111868309395037871201532472631388692216556802188886648933200;
    
    uint256 constant IC5x = 1067715340329954648000929334786755238489338918134036334525440236555514168263;
    uint256 constant IC5y = 2862288057856602344010769823325269404542054869112532752089014922823313585908;
    
    uint256 constant IC6x = 21271125352566672889126725816349845907112018718682888017273104839531163545390;
    uint256 constant IC6y = 1785168599295447131282407481239479885376204420225045887403725379976131213210;
    
    uint256 constant IC7x = 8151238138858585021856450218249863615809934337200113146718724800988078408436;
    uint256 constant IC7y = 2657899755216006462822772673784123104847091221226757806442450501335713762825;
    
    uint256 constant IC8x = 8171769019825445994154340232701026045530184168930052554501865328408819133121;
    uint256 constant IC8y = 10660997355823902699832691249983393599088959852865808325055069379502548566495;
    
    uint256 constant IC9x = 3361839332821824739940332067689914042282373826450657093575680709296600068335;
    uint256 constant IC9y = 13513602300832012175054250221858468132918952414121089931994793607439799862995;
    
    uint256 constant IC10x = 9484191788258631130779706525029785952884994570596373956234934429582288776467;
    uint256 constant IC10y = 3560089564770962595651419604572552919409009695754936726802584258258475549384;
    
    uint256 constant IC11x = 18931593710122699262882889430129544959221054280970569001453447735895901060452;
    uint256 constant IC11y = 3893817938975251953372132584844642867427930745042267991684518779245074511564;
    
    uint256 constant IC12x = 20484423585133914932626042809442103445333121253174080671743332367217943004081;
    uint256 constant IC12y = 17611272514179892356449100843685922089470093072317652858890549791384259226599;
    
    uint256 constant IC13x = 12656120088915025058828042778490372152257311174901808187153200463876151021074;
    uint256 constant IC13y = 11481528772538827440108994718547109908279663907557604042286518627345623584777;
    
    uint256 constant IC14x = 5150324111087352905552097538738539476458994623139267729539697862924684949207;
    uint256 constant IC14y = 14280679617515137366486827439721080564274044300331587745963461384460491075542;
    
    uint256 constant IC15x = 15599895585145451050386519958125280841520760451837696026690822038537780604997;
    uint256 constant IC15y = 13027267734498437392213070576444250471514553553364126679309086744915090972179;
    
    uint256 constant IC16x = 1503647422585262448423757747672398445213165825390355094328994006768247274750;
    uint256 constant IC16y = 9285206141343023672450617161819616548580285504633993067825291487187335331421;
    
    uint256 constant IC17x = 8160320108466003718501351401299134564001404488157181602922516633160942724381;
    uint256 constant IC17y = 10846820262315834520486614019861081390553574922080641212265339598131581331881;
    
 
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
