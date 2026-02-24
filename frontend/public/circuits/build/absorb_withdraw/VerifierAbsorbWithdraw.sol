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
    uint256 constant deltax1 = 3640091547828754170428472777623190550616053676367914895985163345598436706421;
    uint256 constant deltax2 = 9518612610808460353455636941409606113139661096487043227623955982211270125518;
    uint256 constant deltay1 = 20893348674223700013706827269817129813009440606763279280964660174701815876689;
    uint256 constant deltay2 = 15932234998591528622981093421687741048019440697933629796050604587195939493814;

    
    uint256 constant IC0x = 16167384231939517324070715074278162488738932848787409355069106774897936909802;
    uint256 constant IC0y = 14036895394769763878638667815488484729665520220318155144605621167894706177465;
    
    uint256 constant IC1x = 120978625997321631289695792136716421298626620158843622243083378704292177074;
    uint256 constant IC1y = 21342374254520413389655906408279381482910996204183310333840176947296476461032;
    
    uint256 constant IC2x = 20602270468921473349505761493071855272789083458454386513808844437654848867093;
    uint256 constant IC2y = 21524358093063593361077221594885235003911270552392331515449471034532328821204;
    
    uint256 constant IC3x = 19406536131230170422981636056575164405083218896625645498565627970211812144482;
    uint256 constant IC3y = 9527802994188900190678757754066372704432014949640422554515215641427347292735;
    
    uint256 constant IC4x = 21796810188551156213168730771797638644920422513571094469159741641711753082583;
    uint256 constant IC4y = 3376763866007398859387856398348552206705839430866498558410144709314631100778;
    
    uint256 constant IC5x = 1531729937093949106469173587862156754853467075392039524637645793844081075631;
    uint256 constant IC5y = 20109541053599789760346376258780981239591307461804651856556352229992058616237;
    
    uint256 constant IC6x = 7287506415515103721379431915429835423182461077345854750587741844217006702565;
    uint256 constant IC6y = 10586822328735773729704622291860622839130725342300474128278347613277795611961;
    
    uint256 constant IC7x = 2842930162249790005469666169799992579516598705271810144038829544824923441707;
    uint256 constant IC7y = 15475541134066122360054412812994728466047621003717943238977466109490080529497;
    
    uint256 constant IC8x = 16618214970697169732895280234424117564199489017058024150053743520443985250232;
    uint256 constant IC8y = 6577197929712018241524279822012255010213651932795257461989482753498185506940;
    
    uint256 constant IC9x = 7818758982069879333193407436100646293694923701631851557468132152558359042085;
    uint256 constant IC9y = 8590324091449199386443818775653858092471145404045799554705254919748738562709;
    
    uint256 constant IC10x = 21837062268692329113695432573436002778297361896332255114655914800002286615474;
    uint256 constant IC10y = 16218713840654513663230010375500047868578824006569386155550513885074324998315;
    
    uint256 constant IC11x = 11937833797234241498745347461630653659416878956517017153677156297258961849120;
    uint256 constant IC11y = 12385422459697790390526188625975138669813499878836360680074064328837369977417;
    
    uint256 constant IC12x = 16927733803531315679731171452898828453521825080100783249977973014358423592060;
    uint256 constant IC12y = 2504900117826306724862353413249100952008486565130078999652687606084481595684;
    
    uint256 constant IC13x = 20006664335483134884657424864965051375177974900655885292635795288686790316727;
    uint256 constant IC13y = 10387843849608142004906114113613820670161522258297411813947666911114809414822;
    
    uint256 constant IC14x = 2474188254039805349390679670564888766131321199312970526173887760098891901811;
    uint256 constant IC14y = 17299325126235192518246799413100126357288515805277423694465332510402185596128;
    
    uint256 constant IC15x = 9109777589045951609067320462855222737187959793242009079792101928324518654733;
    uint256 constant IC15y = 3192929668442447364304255189505003221639237642220902457745854325579297003291;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[15] calldata _pubSignals) public view returns (bool) {
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
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
