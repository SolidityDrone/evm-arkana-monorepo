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
    uint256 constant deltax1 = 6170512337626091851168226338207407027835851254944257211883931964051041732008;
    uint256 constant deltax2 = 14732763287213075944436660755271342468532339121465385837625394787003159060565;
    uint256 constant deltay1 = 18656045557675112048458935202723479155931792102582582592734316824389865244829;
    uint256 constant deltay2 = 18856403859891886101953150417694008808383112967562364327043376266803746368740;

    
    uint256 constant IC0x = 18410221641177103098682922854202214329859174138733736231492038788033597501945;
    uint256 constant IC0y = 12394878408724196706808621685515575790150071559260344326797956734578764961681;
    
    uint256 constant IC1x = 6251616801858888278754925898729038962218915935351433437374207806989563572637;
    uint256 constant IC1y = 11865115085059614711318060540041924728868241510285015709525255573864753856422;
    
    uint256 constant IC2x = 15311012430511019137968546337096749043326712913921760618336727179319547702426;
    uint256 constant IC2y = 12389759055360521631143903323706986790274273476828858848406612009482681132216;
    
    uint256 constant IC3x = 7183023399902377934455589657725992535340819819653458348924919572566544569360;
    uint256 constant IC3y = 7853474990387312794679363121838077916064688041562393347162075639984066682202;
    
    uint256 constant IC4x = 7285934531315037052912832362491214300804687201013286766865376399552000743648;
    uint256 constant IC4y = 2851251410713793338950218815022309774547781994146371393400649617766285340377;
    
    uint256 constant IC5x = 3470536661930318453712754326337460504936701847653651181118881408902250981283;
    uint256 constant IC5y = 4533020387581417628886393780567379961163731062223754061339965011219808816929;
    
    uint256 constant IC6x = 1984966376020623041116150245907122199070119272708468259293036610723264173644;
    uint256 constant IC6y = 6695503791033890661815487910001382656191674043791638778998033195482973066974;
    
    uint256 constant IC7x = 7343148831347056186643208612253491239625043004745811973106503501033356497970;
    uint256 constant IC7y = 14205944832032044529107172218464449996223423779074103691279857831707830839756;
    
    uint256 constant IC8x = 9340522621879088612247799292383117931248860477980351623192496656548067965472;
    uint256 constant IC8y = 2070230933852950266916733896876638692513565962366057218780490494203386872847;
    
    uint256 constant IC9x = 16231155532571029493300719590117061372561417780450329693258407014872463555033;
    uint256 constant IC9y = 5023973338116716451404448776634841064053210582944028033793101979479814766991;
    
    uint256 constant IC10x = 20979206199593632902649673762881921080520407448459719009916108100283576900517;
    uint256 constant IC10y = 12125215758893765819257006946729909259345136525000149917351361321970311744308;
    
    uint256 constant IC11x = 16270729430320072127344488105925829640406317250759020792038668241579214906666;
    uint256 constant IC11y = 2111225935075416643487430412343710502552533531741011582530271365759246501526;
    
    uint256 constant IC12x = 15914605680321317172199666420907465493892107841023930055194825687252136269135;
    uint256 constant IC12y = 11063762745383328640306350384258576472701803994980347014612178540206991332785;
    
    uint256 constant IC13x = 21156928480235037585352633463680548641999967096960590643400648399986034825576;
    uint256 constant IC13y = 7800259422085456443296371572408944730065861296384713967678327499414251054612;
    
    uint256 constant IC14x = 3609079010892904808195195177521644781668317254077649140382955733634978306887;
    uint256 constant IC14y = 20182100579574936923923785296939994104667996074724565267788496764031285998115;
    
    uint256 constant IC15x = 15085474246571772222845380855198416992323495625169674875304617941264640933709;
    uint256 constant IC15y = 2268573185817907936704337371461369428767818739627210620597804328228672348933;
    
    uint256 constant IC16x = 4809462658743035818993474694463154087249215947877557375632262978745007152400;
    uint256 constant IC16y = 14340826797197918160695437093480200018920089475608766462457562072641935662084;
    
    uint256 constant IC17x = 17882062547843872034458123280108500248251995364123427832022878398060250305134;
    uint256 constant IC17y = 9024441977511535385385489824391128991673767797542822253012056452351808065259;
    
 
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
