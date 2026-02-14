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
    uint256 constant deltax1 = 6007144223134615305169522227677922328801375664094322893936415509404909075749;
    uint256 constant deltax2 = 7522877178107991296902662820264875398076280665899206341464935188138289533520;
    uint256 constant deltay1 = 10113131504449724747455478017152013075322443013860135262100783852667478440720;
    uint256 constant deltay2 = 2900220532989085789093926814045256420052141014188732714675090734182709219689;

    
    uint256 constant IC0x = 12487940250280455787253430466338619941798462139601819206603652518255448768473;
    uint256 constant IC0y = 6490523648822355871941150454090222321199309085565712664924726844005912089036;
    
    uint256 constant IC1x = 9589647760797520916265724514050987008983785509486020148352154842502944649013;
    uint256 constant IC1y = 1894361760627856480680828917645493581260881119046416235882298208900751451870;
    
    uint256 constant IC2x = 20823639988278177788310076663412996820947528566912665544893518963393930420418;
    uint256 constant IC2y = 1862056907270340115208093061001075044228066295680974549888493196375331480256;
    
    uint256 constant IC3x = 18519282830751878369804483564159423985721497168945478731258095039238164585840;
    uint256 constant IC3y = 19490506267340721579610299913850739996140301997479579011402463244031835870610;
    
    uint256 constant IC4x = 5161712966305604104109369944509780190962788121566482370285910483491352965654;
    uint256 constant IC4y = 14951320661312447444777892621511212379407554334916282586337791373410093721484;
    
    uint256 constant IC5x = 16594842167419261730289934174699856169793708927964201895309981286065922426596;
    uint256 constant IC5y = 2491502142431332769112412342560116397246661256416701420841608998988446583986;
    
    uint256 constant IC6x = 14551960290884511278658243561705124991435452826300067059443918479253860200315;
    uint256 constant IC6y = 12567693815447536186056818631020073569320549896110348863602985047990119827689;
    
    uint256 constant IC7x = 11355313440844115762021594330470889029951260283569307873967212779354045584978;
    uint256 constant IC7y = 21349757756374051854109259502025153290500106871526166291740464704870247244319;
    
    uint256 constant IC8x = 20981327233370461366425207019603047862951664707852624266478974131455640488483;
    uint256 constant IC8y = 9513002246974999563528570778389235312896871265845639461069005928280277770942;
    
    uint256 constant IC9x = 19581311054641660676526225223215223979982801909467263420823680831855692516900;
    uint256 constant IC9y = 5861508705887120247998276003094573331228433826817197161342666218543023536646;
    
    uint256 constant IC10x = 13531713517900270405432279646689794250699439332963570516334967475753872054000;
    uint256 constant IC10y = 16693213018687251182670940855489920093570731176878903638595926491733667441073;
    
    uint256 constant IC11x = 2104752803290521694815399066336288088044688271837887857176105024129186955441;
    uint256 constant IC11y = 7520825916282681458308584021696822795239303242833917410499288546508537678425;
    
    uint256 constant IC12x = 11101660743779843257521489440581528492163935434352104787523804238953434163009;
    uint256 constant IC12y = 10914731216038714621669429363677515970324248427361937262763762032548608384853;
    
    uint256 constant IC13x = 10994765694409512556499639879469766343705829129151182992381994042963386962824;
    uint256 constant IC13y = 2660331004075181141171693742423530223709070214108878339501220609331782891623;
    
    uint256 constant IC14x = 15063276823363211209326634174158867072294330424733845798425559243674024569950;
    uint256 constant IC14y = 14142164986774789161935079013824800439397391152843886491950008975200428623006;
    
    uint256 constant IC15x = 21838603551276847322090873638799199839870002422565481681077065082324987421130;
    uint256 constant IC15y = 21511123738967564187354606065472724583608491311455870072689318849914739975932;
    
    uint256 constant IC16x = 8850530945236119553156827868533943452061268249672798729396953435251434233178;
    uint256 constant IC16y = 16909215085754094927762201489509747263165365940950835649752003381425718346296;
    
    uint256 constant IC17x = 761824909565837835701728243002368968741537871206475846065779913440466245925;
    uint256 constant IC17y = 14938636906467590792979782762712133881118105635291020876807673223468420489760;
    
 
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
