#include <stdio.h>
#include <iostream>
#include <assert.h>
#include "circom.hpp"
#include "calcwit.hpp"
void MatrixMultiplication4x4_0_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void MatrixMultiplication4x4_0_run(uint ctx_index,Circom_CalcWit* ctx);
void SingleSBox_1_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void SingleSBox_1_run(uint ctx_index,Circom_CalcWit* ctx);
void SBox_2_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void SBox_2_run(uint ctx_index,Circom_CalcWit* ctx);
void InternalMatrixMultiplication_3_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void InternalMatrixMultiplication_3_run(uint ctx_index,Circom_CalcWit* ctx);
void Poseidon2Permutation_4_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Poseidon2Permutation_4_run(uint ctx_index,Circom_CalcWit* ctx);
void Poseidon2Hash3_5_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Poseidon2Hash3_5_run(uint ctx_index,Circom_CalcWit* ctx);
void Poseidon2Hash2_6_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Poseidon2Hash2_6_run(uint ctx_index,Circom_CalcWit* ctx);
void Num2Bits_7_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Num2Bits_7_run(uint ctx_index,Circom_CalcWit* ctx);
void Num2Bits_8_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Num2Bits_8_run(uint ctx_index,Circom_CalcWit* ctx);
void Num2Bits_9_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Num2Bits_9_run(uint ctx_index,Circom_CalcWit* ctx);
void IsZero_10_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void IsZero_10_run(uint ctx_index,Circom_CalcWit* ctx);
void Edwards2Montgomery_11_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Edwards2Montgomery_11_run(uint ctx_index,Circom_CalcWit* ctx);
void MontgomeryDouble_12_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void MontgomeryDouble_12_run(uint ctx_index,Circom_CalcWit* ctx);
void MontgomeryAdd_13_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void MontgomeryAdd_13_run(uint ctx_index,Circom_CalcWit* ctx);
void Multiplexor2_14_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Multiplexor2_14_run(uint ctx_index,Circom_CalcWit* ctx);
void BitElementMulAny_15_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void BitElementMulAny_15_run(uint ctx_index,Circom_CalcWit* ctx);
void Montgomery2Edwards_16_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Montgomery2Edwards_16_run(uint ctx_index,Circom_CalcWit* ctx);
void BabyAdd_17_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void BabyAdd_17_run(uint ctx_index,Circom_CalcWit* ctx);
void SegmentMulAny_18_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void SegmentMulAny_18_run(uint ctx_index,Circom_CalcWit* ctx);
void EscalarMulAny_19_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void EscalarMulAny_19_run(uint ctx_index,Circom_CalcWit* ctx);
void SegmentMulAny_20_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void SegmentMulAny_20_run(uint ctx_index,Circom_CalcWit* ctx);
void SegmentMulAny_21_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void SegmentMulAny_21_run(uint ctx_index,Circom_CalcWit* ctx);
void EscalarMulAny_22_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void EscalarMulAny_22_run(uint ctx_index,Circom_CalcWit* ctx);
void SegmentMulAny_23_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void SegmentMulAny_23_run(uint ctx_index,Circom_CalcWit* ctx);
void EscalarMulAny_24_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void EscalarMulAny_24_run(uint ctx_index,Circom_CalcWit* ctx);
void PedersenCommitmentBase3_25_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void PedersenCommitmentBase3_25_run(uint ctx_index,Circom_CalcWit* ctx);
void PedersenCommitmentM1_26_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void PedersenCommitmentM1_26_run(uint ctx_index,Circom_CalcWit* ctx);
void PedersenCommitmentR_27_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void PedersenCommitmentR_27_run(uint ctx_index,Circom_CalcWit* ctx);
void IsEqual_28_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void IsEqual_28_run(uint ctx_index,Circom_CalcWit* ctx);
void Num2Bits_29_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Num2Bits_29_run(uint ctx_index,Circom_CalcWit* ctx);
void Num2Bits_30_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Num2Bits_30_run(uint ctx_index,Circom_CalcWit* ctx);
void LessThan_31_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void LessThan_31_run(uint ctx_index,Circom_CalcWit* ctx);
void LeanIMTVerify_32_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void LeanIMTVerify_32_run(uint ctx_index,Circom_CalcWit* ctx);
void Bits2Num_33_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Bits2Num_33_run(uint ctx_index,Circom_CalcWit* ctx);
void UnpackUnlocksAt_34_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void UnpackUnlocksAt_34_run(uint ctx_index,Circom_CalcWit* ctx);
void Num2Bits_35_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Num2Bits_35_run(uint ctx_index,Circom_CalcWit* ctx);
void LessThan_36_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void LessThan_36_run(uint ctx_index,Circom_CalcWit* ctx);
void GreaterThanOrEqualField_37_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void GreaterThanOrEqualField_37_run(uint ctx_index,Circom_CalcWit* ctx);
void PoseidonKeystream_38_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void PoseidonKeystream_38_run(uint ctx_index,Circom_CalcWit* ctx);
void PoseidonCTREncrypt_39_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void PoseidonCTREncrypt_39_run(uint ctx_index,Circom_CalcWit* ctx);
void PedersenCommitment2FixedM1_40_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void PedersenCommitment2FixedM1_40_run(uint ctx_index,Circom_CalcWit* ctx);
void Withdraw_41_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather);
void Withdraw_41_run(uint ctx_index,Circom_CalcWit* ctx);
Circom_TemplateFunction _functionTable[42] = { 
MatrixMultiplication4x4_0_run,
SingleSBox_1_run,
SBox_2_run,
InternalMatrixMultiplication_3_run,
Poseidon2Permutation_4_run,
Poseidon2Hash3_5_run,
Poseidon2Hash2_6_run,
Num2Bits_7_run,
Num2Bits_8_run,
Num2Bits_9_run,
IsZero_10_run,
Edwards2Montgomery_11_run,
MontgomeryDouble_12_run,
MontgomeryAdd_13_run,
Multiplexor2_14_run,
BitElementMulAny_15_run,
Montgomery2Edwards_16_run,
BabyAdd_17_run,
SegmentMulAny_18_run,
EscalarMulAny_19_run,
SegmentMulAny_20_run,
SegmentMulAny_21_run,
EscalarMulAny_22_run,
SegmentMulAny_23_run,
EscalarMulAny_24_run,
PedersenCommitmentBase3_25_run,
PedersenCommitmentM1_26_run,
PedersenCommitmentR_27_run,
IsEqual_28_run,
Num2Bits_29_run,
Num2Bits_30_run,
LessThan_31_run,
LeanIMTVerify_32_run,
Bits2Num_33_run,
UnpackUnlocksAt_34_run,
Num2Bits_35_run,
LessThan_36_run,
GreaterThanOrEqualField_37_run,
PoseidonKeystream_38_run,
PoseidonCTREncrypt_39_run,
PedersenCommitment2FixedM1_40_run,
Withdraw_41_run };
Circom_TemplateFunction _functionTableParallel[42] = { 
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL };
uint get_main_input_signal_start() {return 8;}

uint get_main_input_signal_no() {return 48;}

uint get_total_signal_no() {return 169892;}

uint get_number_of_components() {return 17447;}

uint get_size_of_input_hashmap() {return 256;}

uint get_size_of_witness() {return 29358;}

uint get_size_of_constants() {return 193;}

uint get_size_of_io_map() {return 2;}

uint get_size_of_bus_field_map() {return 0;}

void release_memory_component(Circom_CalcWit* ctx, uint pos) {{

if (pos != 0){{

if(ctx->componentMemory[pos].subcomponents)
delete []ctx->componentMemory[pos].subcomponents;

if(ctx->componentMemory[pos].subcomponentsParallel)
delete []ctx->componentMemory[pos].subcomponentsParallel;

if(ctx->componentMemory[pos].outputIsSet)
delete []ctx->componentMemory[pos].outputIsSet;

if(ctx->componentMemory[pos].mutexes)
delete []ctx->componentMemory[pos].mutexes;

if(ctx->componentMemory[pos].cvs)
delete []ctx->componentMemory[pos].cvs;

if(ctx->componentMemory[pos].sbct)
delete []ctx->componentMemory[pos].sbct;

}}


}}


// function declarations
// template declarations
void MatrixMultiplication4x4_0_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 0;
ctx->componentMemory[coffset].templateName = "MatrixMultiplication4x4";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 4;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void MatrixMultiplication4x4_0_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[1];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &signalValues[mySignalStart + 8];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 4],&signalValues[mySignalStart + 5]); // line circom 54
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 9];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 6],&signalValues[mySignalStart + 7]); // line circom 55
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 10];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 5],&signalValues[mySignalStart + 5]); // line circom 56
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 11];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 10],&signalValues[mySignalStart + 9]); // line circom 57
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 12];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 7],&signalValues[mySignalStart + 7]); // line circom 58
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 13];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 12],&signalValues[mySignalStart + 8]); // line circom 59
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 14];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 9],&signalValues[mySignalStart + 9]); // line circom 60
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 15];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 14],&signalValues[mySignalStart + 14]); // line circom 61
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 16];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 15],&signalValues[mySignalStart + 13]); // line circom 62
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 17];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 8],&signalValues[mySignalStart + 8]); // line circom 63
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 18];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 17],&signalValues[mySignalStart + 17]); // line circom 64
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 19];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 18],&signalValues[mySignalStart + 11]); // line circom 65
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 20];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 13],&signalValues[mySignalStart + 19]); // line circom 66
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 21];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 11],&signalValues[mySignalStart + 16]); // line circom 67
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 20]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 19]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 21]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 16]);
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void SingleSBox_1_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 1;
ctx->componentMemory[coffset].templateName = "SingleSBox";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void SingleSBox_1_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[1];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
Fr_mul(&expaux[0],&signalValues[mySignalStart + 1],&signalValues[mySignalStart + 1]); // line circom 15
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 3];
// load src
Fr_mul(&expaux[0],&signalValues[mySignalStart + 2],&signalValues[mySignalStart + 2]); // line circom 16
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
Fr_mul(&expaux[0],&signalValues[mySignalStart + 3],&signalValues[mySignalStart + 1]); // line circom 17
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void SBox_2_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 2;
ctx->componentMemory[coffset].templateName = "SBox";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 4;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[4]{0};
}

void SBox_2_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[1];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
uint aux_create = 0;
int aux_cmp_num = 0+ctx_index+1;
uint csoffset = mySignalStart+8;
uint aux_dimensions[1] = {4};
for (uint i = 0; i < 4; i++) {
std::string new_cmp_name = "sbox"+ctx->generate_position_array(aux_dimensions, 1, i);
SingleSBox_1_create(csoffset,aux_cmp_num,ctx,new_cmp_name,myId);
mySubcomponents[aux_create+ i] = aux_cmp_num;
csoffset += 4 ;
aux_cmp_num += 1;
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 26
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[0])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[0])) + 4)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[0])) + 0)];
// load src
cmp_index_ref_load = ((1 * Fr_toInt(&lvar[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&lvar[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&lvar[0])) + 0)]].signalStart + 0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 26
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 26
}
for (uint i = 0; i < 4; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void InternalMatrixMultiplication_3_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 3;
ctx->componentMemory[coffset].templateName = "InternalMatrixMultiplication";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 8;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void InternalMatrixMultiplication_3_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[3];
FrElement lvar[1];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &signalValues[mySignalStart + 12];
// load src
Fr_add(&expaux[2],&signalValues[mySignalStart + 4],&signalValues[mySignalStart + 5]); // line circom 82
Fr_add(&expaux[1],&expaux[2],&signalValues[mySignalStart + 6]); // line circom 82
Fr_add(&expaux[0],&expaux[1],&signalValues[mySignalStart + 7]); // line circom 82
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 84
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[0])) + 0)];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[0])) + 4)],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[0])) + 8)]); // line circom 85
Fr_add(&expaux[0],&expaux[1],&signalValues[mySignalStart + 12]); // line circom 85
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 84
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 84
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Poseidon2Permutation_4_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 4;
ctx->componentMemory[coffset].templateName = "Poseidon2Permutation";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 4;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[129]{0};
}

void Poseidon2Permutation_4_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "matrix_mul";
MatrixMultiplication4x4_0_create(mySignalStart+1680,160+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 160+ctx_index+1;
}
{
std::string new_cmp_name = "ext_sbox_0";
SBox_2_create(mySignalStart+536,8+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 8+ctx_index+1;
}
{
std::string new_cmp_name = "ext_matrix_0";
MatrixMultiplication4x4_0_create(mySignalStart+360,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[2] = 0+ctx_index+1;
}
{
std::string new_cmp_name = "ext_sbox_1";
SBox_2_create(mySignalStart+560,13+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[3] = 13+ctx_index+1;
}
{
std::string new_cmp_name = "ext_matrix_1";
MatrixMultiplication4x4_0_create(mySignalStart+382,1+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[4] = 1+ctx_index+1;
}
{
std::string new_cmp_name = "ext_sbox_2";
SBox_2_create(mySignalStart+584,18+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[5] = 18+ctx_index+1;
}
{
std::string new_cmp_name = "ext_matrix_2";
MatrixMultiplication4x4_0_create(mySignalStart+404,2+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[6] = 2+ctx_index+1;
}
{
std::string new_cmp_name = "ext_sbox_3";
SBox_2_create(mySignalStart+608,23+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[7] = 23+ctx_index+1;
}
{
std::string new_cmp_name = "ext_matrix_3";
MatrixMultiplication4x4_0_create(mySignalStart+426,3+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[8] = 3+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_0";
SingleSBox_1_create(mySignalStart+1456,104+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[9] = 104+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_0";
InternalMatrixMultiplication_3_create(mySignalStart+728,48+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[10] = 48+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_1";
SingleSBox_1_create(mySignalStart+1460,105+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[11] = 105+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_1";
InternalMatrixMultiplication_3_create(mySignalStart+741,49+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[12] = 49+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_2";
SingleSBox_1_create(mySignalStart+1504,116+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[13] = 116+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_2";
InternalMatrixMultiplication_3_create(mySignalStart+884,60+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[14] = 60+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_3";
SingleSBox_1_create(mySignalStart+1548,127+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[15] = 127+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_3";
InternalMatrixMultiplication_3_create(mySignalStart+1027,71+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[16] = 71+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_4";
SingleSBox_1_create(mySignalStart+1592,138+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[17] = 138+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_4";
InternalMatrixMultiplication_3_create(mySignalStart+1170,82+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[18] = 82+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_5";
SingleSBox_1_create(mySignalStart+1636,149+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[19] = 149+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_5";
InternalMatrixMultiplication_3_create(mySignalStart+1313,93+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[20] = 93+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_6";
SingleSBox_1_create(mySignalStart+1664,156+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[21] = 156+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_6";
InternalMatrixMultiplication_3_create(mySignalStart+1404,100+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[22] = 100+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_7";
SingleSBox_1_create(mySignalStart+1668,157+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[23] = 157+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_7";
InternalMatrixMultiplication_3_create(mySignalStart+1417,101+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[24] = 101+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_8";
SingleSBox_1_create(mySignalStart+1672,158+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[25] = 158+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_8";
InternalMatrixMultiplication_3_create(mySignalStart+1430,102+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[26] = 102+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_9";
SingleSBox_1_create(mySignalStart+1676,159+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[27] = 159+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_9";
InternalMatrixMultiplication_3_create(mySignalStart+1443,103+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[28] = 103+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_10";
SingleSBox_1_create(mySignalStart+1464,106+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[29] = 106+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_10";
InternalMatrixMultiplication_3_create(mySignalStart+754,50+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[30] = 50+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_11";
SingleSBox_1_create(mySignalStart+1468,107+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[31] = 107+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_11";
InternalMatrixMultiplication_3_create(mySignalStart+767,51+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[32] = 51+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_12";
SingleSBox_1_create(mySignalStart+1472,108+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[33] = 108+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_12";
InternalMatrixMultiplication_3_create(mySignalStart+780,52+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[34] = 52+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_13";
SingleSBox_1_create(mySignalStart+1476,109+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[35] = 109+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_13";
InternalMatrixMultiplication_3_create(mySignalStart+793,53+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[36] = 53+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_14";
SingleSBox_1_create(mySignalStart+1480,110+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[37] = 110+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_14";
InternalMatrixMultiplication_3_create(mySignalStart+806,54+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[38] = 54+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_15";
SingleSBox_1_create(mySignalStart+1484,111+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[39] = 111+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_15";
InternalMatrixMultiplication_3_create(mySignalStart+819,55+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[40] = 55+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_16";
SingleSBox_1_create(mySignalStart+1488,112+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[41] = 112+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_16";
InternalMatrixMultiplication_3_create(mySignalStart+832,56+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[42] = 56+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_17";
SingleSBox_1_create(mySignalStart+1492,113+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[43] = 113+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_17";
InternalMatrixMultiplication_3_create(mySignalStart+845,57+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[44] = 57+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_18";
SingleSBox_1_create(mySignalStart+1496,114+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[45] = 114+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_18";
InternalMatrixMultiplication_3_create(mySignalStart+858,58+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[46] = 58+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_19";
SingleSBox_1_create(mySignalStart+1500,115+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[47] = 115+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_19";
InternalMatrixMultiplication_3_create(mySignalStart+871,59+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[48] = 59+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_20";
SingleSBox_1_create(mySignalStart+1508,117+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[49] = 117+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_20";
InternalMatrixMultiplication_3_create(mySignalStart+897,61+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[50] = 61+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_21";
SingleSBox_1_create(mySignalStart+1512,118+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[51] = 118+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_21";
InternalMatrixMultiplication_3_create(mySignalStart+910,62+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[52] = 62+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_22";
SingleSBox_1_create(mySignalStart+1516,119+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[53] = 119+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_22";
InternalMatrixMultiplication_3_create(mySignalStart+923,63+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[54] = 63+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_23";
SingleSBox_1_create(mySignalStart+1520,120+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[55] = 120+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_23";
InternalMatrixMultiplication_3_create(mySignalStart+936,64+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[56] = 64+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_24";
SingleSBox_1_create(mySignalStart+1524,121+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[57] = 121+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_24";
InternalMatrixMultiplication_3_create(mySignalStart+949,65+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[58] = 65+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_25";
SingleSBox_1_create(mySignalStart+1528,122+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[59] = 122+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_25";
InternalMatrixMultiplication_3_create(mySignalStart+962,66+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[60] = 66+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_26";
SingleSBox_1_create(mySignalStart+1532,123+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[61] = 123+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_26";
InternalMatrixMultiplication_3_create(mySignalStart+975,67+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[62] = 67+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_27";
SingleSBox_1_create(mySignalStart+1536,124+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[63] = 124+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_27";
InternalMatrixMultiplication_3_create(mySignalStart+988,68+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[64] = 68+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_28";
SingleSBox_1_create(mySignalStart+1540,125+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[65] = 125+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_28";
InternalMatrixMultiplication_3_create(mySignalStart+1001,69+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[66] = 69+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_29";
SingleSBox_1_create(mySignalStart+1544,126+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[67] = 126+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_29";
InternalMatrixMultiplication_3_create(mySignalStart+1014,70+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[68] = 70+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_30";
SingleSBox_1_create(mySignalStart+1552,128+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[69] = 128+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_30";
InternalMatrixMultiplication_3_create(mySignalStart+1040,72+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[70] = 72+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_31";
SingleSBox_1_create(mySignalStart+1556,129+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[71] = 129+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_31";
InternalMatrixMultiplication_3_create(mySignalStart+1053,73+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[72] = 73+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_32";
SingleSBox_1_create(mySignalStart+1560,130+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[73] = 130+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_32";
InternalMatrixMultiplication_3_create(mySignalStart+1066,74+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[74] = 74+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_33";
SingleSBox_1_create(mySignalStart+1564,131+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[75] = 131+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_33";
InternalMatrixMultiplication_3_create(mySignalStart+1079,75+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[76] = 75+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_34";
SingleSBox_1_create(mySignalStart+1568,132+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[77] = 132+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_34";
InternalMatrixMultiplication_3_create(mySignalStart+1092,76+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[78] = 76+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_35";
SingleSBox_1_create(mySignalStart+1572,133+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[79] = 133+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_35";
InternalMatrixMultiplication_3_create(mySignalStart+1105,77+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[80] = 77+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_36";
SingleSBox_1_create(mySignalStart+1576,134+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[81] = 134+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_36";
InternalMatrixMultiplication_3_create(mySignalStart+1118,78+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[82] = 78+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_37";
SingleSBox_1_create(mySignalStart+1580,135+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[83] = 135+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_37";
InternalMatrixMultiplication_3_create(mySignalStart+1131,79+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[84] = 79+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_38";
SingleSBox_1_create(mySignalStart+1584,136+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[85] = 136+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_38";
InternalMatrixMultiplication_3_create(mySignalStart+1144,80+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[86] = 80+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_39";
SingleSBox_1_create(mySignalStart+1588,137+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[87] = 137+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_39";
InternalMatrixMultiplication_3_create(mySignalStart+1157,81+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[88] = 81+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_40";
SingleSBox_1_create(mySignalStart+1596,139+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[89] = 139+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_40";
InternalMatrixMultiplication_3_create(mySignalStart+1183,83+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[90] = 83+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_41";
SingleSBox_1_create(mySignalStart+1600,140+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[91] = 140+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_41";
InternalMatrixMultiplication_3_create(mySignalStart+1196,84+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[92] = 84+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_42";
SingleSBox_1_create(mySignalStart+1604,141+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[93] = 141+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_42";
InternalMatrixMultiplication_3_create(mySignalStart+1209,85+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[94] = 85+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_43";
SingleSBox_1_create(mySignalStart+1608,142+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[95] = 142+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_43";
InternalMatrixMultiplication_3_create(mySignalStart+1222,86+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[96] = 86+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_44";
SingleSBox_1_create(mySignalStart+1612,143+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[97] = 143+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_44";
InternalMatrixMultiplication_3_create(mySignalStart+1235,87+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[98] = 87+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_45";
SingleSBox_1_create(mySignalStart+1616,144+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[99] = 144+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_45";
InternalMatrixMultiplication_3_create(mySignalStart+1248,88+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[100] = 88+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_46";
SingleSBox_1_create(mySignalStart+1620,145+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[101] = 145+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_46";
InternalMatrixMultiplication_3_create(mySignalStart+1261,89+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[102] = 89+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_47";
SingleSBox_1_create(mySignalStart+1624,146+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[103] = 146+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_47";
InternalMatrixMultiplication_3_create(mySignalStart+1274,90+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[104] = 90+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_48";
SingleSBox_1_create(mySignalStart+1628,147+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[105] = 147+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_48";
InternalMatrixMultiplication_3_create(mySignalStart+1287,91+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[106] = 91+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_49";
SingleSBox_1_create(mySignalStart+1632,148+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[107] = 148+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_49";
InternalMatrixMultiplication_3_create(mySignalStart+1300,92+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[108] = 92+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_50";
SingleSBox_1_create(mySignalStart+1640,150+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[109] = 150+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_50";
InternalMatrixMultiplication_3_create(mySignalStart+1326,94+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[110] = 94+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_51";
SingleSBox_1_create(mySignalStart+1644,151+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[111] = 151+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_51";
InternalMatrixMultiplication_3_create(mySignalStart+1339,95+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[112] = 95+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_52";
SingleSBox_1_create(mySignalStart+1648,152+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[113] = 152+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_52";
InternalMatrixMultiplication_3_create(mySignalStart+1352,96+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[114] = 96+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_53";
SingleSBox_1_create(mySignalStart+1652,153+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[115] = 153+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_53";
InternalMatrixMultiplication_3_create(mySignalStart+1365,97+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[116] = 97+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_54";
SingleSBox_1_create(mySignalStart+1656,154+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[117] = 154+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_54";
InternalMatrixMultiplication_3_create(mySignalStart+1378,98+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[118] = 98+ctx_index+1;
}
{
std::string new_cmp_name = "int_sbox_55";
SingleSBox_1_create(mySignalStart+1660,155+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[119] = 155+ctx_index+1;
}
{
std::string new_cmp_name = "int_matrix_55";
InternalMatrixMultiplication_3_create(mySignalStart+1391,99+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[120] = 99+ctx_index+1;
}
{
std::string new_cmp_name = "ext_sbox_60";
SBox_2_create(mySignalStart+632,28+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[121] = 28+ctx_index+1;
}
{
std::string new_cmp_name = "ext_matrix_60";
MatrixMultiplication4x4_0_create(mySignalStart+448,4+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[122] = 4+ctx_index+1;
}
{
std::string new_cmp_name = "ext_sbox_61";
SBox_2_create(mySignalStart+656,33+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[123] = 33+ctx_index+1;
}
{
std::string new_cmp_name = "ext_matrix_61";
MatrixMultiplication4x4_0_create(mySignalStart+470,5+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[124] = 5+ctx_index+1;
}
{
std::string new_cmp_name = "ext_sbox_62";
SBox_2_create(mySignalStart+680,38+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[125] = 38+ctx_index+1;
}
{
std::string new_cmp_name = "ext_matrix_62";
MatrixMultiplication4x4_0_create(mySignalStart+492,6+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[126] = 6+ctx_index+1;
}
{
std::string new_cmp_name = "ext_sbox_63";
SBox_2_create(mySignalStart+704,43+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[127] = 43+ctx_index+1;
}
{
std::string new_cmp_name = "ext_matrix_63";
MatrixMultiplication4x4_0_create(mySignalStart+514,7+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[128] = 7+ctx_index+1;
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 8];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 4]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 9];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 5]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 10];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 6]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 11];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 7]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 108
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((0 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MatrixMultiplication4x4_0_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 108
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 108
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 111
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((4 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 111
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 111
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 257
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 258
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[5]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[6]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 258
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[7]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 258
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[8]);
}
}else{
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + ((0 + (1 * Fr_toInt(&lvar[0]))) + 272)];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + ((4 + (1 * Fr_toInt(&lvar[0]))) + 8)],&lvar[3]); // line circom 258
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 257
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 257
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 260
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((0 + (1 * Fr_toInt(&lvar[0]))) + 272)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SBox_2_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 260
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 260
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 263
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MatrixMultiplication4x4_0_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 263
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 263
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 266
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((8 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 266
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 266
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 271
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 272
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[9]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[10]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 272
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[11]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 272
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[12]);
}
}else{
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + ((4 + (1 * Fr_toInt(&lvar[0]))) + 272)];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + ((8 + (1 * Fr_toInt(&lvar[0]))) + 8)],&lvar[3]); // line circom 272
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 271
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 271
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 274
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((4 + (1 * Fr_toInt(&lvar[0]))) + 272)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SBox_2_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 274
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 274
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 277
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MatrixMultiplication4x4_0_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 277
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 277
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 280
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((12 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[4]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 280
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 280
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 285
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 286
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[13]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[14]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 286
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[15]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 286
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[16]);
}
}else{
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + ((8 + (1 * Fr_toInt(&lvar[0]))) + 272)];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + ((12 + (1 * Fr_toInt(&lvar[0]))) + 8)],&lvar[3]); // line circom 286
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 285
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 285
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 288
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 5;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((8 + (1 * Fr_toInt(&lvar[0]))) + 272)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SBox_2_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 288
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 288
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 291
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MatrixMultiplication4x4_0_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 291
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 291
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 294
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((16 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 6;
cmp_index_ref_load = 6;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[6]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 294
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 294
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 299
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 300
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[17]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[18]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 300
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[19]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 300
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[20]);
}
}else{
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + ((12 + (1 * Fr_toInt(&lvar[0]))) + 272)];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + ((16 + (1 * Fr_toInt(&lvar[0]))) + 8)],&lvar[3]); // line circom 300
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 299
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 299
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 302
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((12 + (1 * Fr_toInt(&lvar[0]))) + 272)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SBox_2_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 302
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 302
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 305
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 8;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 7;
cmp_index_ref_load = 7;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[7]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MatrixMultiplication4x4_0_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 305
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 305
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 308
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((20 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 8;
cmp_index_ref_load = 8;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[8]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 308
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 308
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 288];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 28],&circuitConstants[22]); // line circom 314
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 9;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 288]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 316
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 317
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 9;
cmp_index_ref_load = 9;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[9]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((20 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 318
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 318
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 318
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 316
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 316
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 320
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((24 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 10;
cmp_index_ref_load = 10;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[10]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 320
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 320
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 289];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 32],&circuitConstants[28]); // line circom 325
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 11;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 289]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 327
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 328
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 12;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 11;
cmp_index_ref_load = 11;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[11]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 12;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((24 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 329
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 329
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 329
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 12;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 12;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 327
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 327
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 331
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((28 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 12;
cmp_index_ref_load = 12;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[12]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 331
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 331
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 290];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 36],&circuitConstants[30]); // line circom 336
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 13;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 290]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 338
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 339
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 14;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 13;
cmp_index_ref_load = 13;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[13]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 14;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((28 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 340
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 340
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 340
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 14;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 14;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 338
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 338
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 342
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((32 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 14;
cmp_index_ref_load = 14;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[14]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 342
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 342
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 291];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 40],&circuitConstants[32]); // line circom 347
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 15;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 291]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 349
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 350
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 16;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 15;
cmp_index_ref_load = 15;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[15]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 16;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((32 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 351
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 351
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 351
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 16;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 16;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 349
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 349
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 353
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((36 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 16;
cmp_index_ref_load = 16;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[16]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 353
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 353
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 292];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 44],&circuitConstants[34]); // line circom 358
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 17;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 292]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 360
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 361
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 18;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 17;
cmp_index_ref_load = 17;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[17]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 18;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((36 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 362
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 362
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 362
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 18;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 18;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 360
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 360
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 364
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((40 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 18;
cmp_index_ref_load = 18;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[18]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 364
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 364
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 293];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 48],&circuitConstants[36]); // line circom 369
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 19;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 293]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 371
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 372
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 20;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 19;
cmp_index_ref_load = 19;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[19]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 20;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((40 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 373
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 373
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 373
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 20;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 20;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 371
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 371
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 375
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((44 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 20;
cmp_index_ref_load = 20;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[20]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 375
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 375
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 294];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 52],&circuitConstants[38]); // line circom 380
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 21;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 294]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 382
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 383
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 22;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 21;
cmp_index_ref_load = 21;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[21]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 22;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((44 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 384
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 384
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 384
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 22;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 22;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 382
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 382
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 386
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((48 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 22;
cmp_index_ref_load = 22;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[22]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 386
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 386
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 295];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 56],&circuitConstants[40]); // line circom 391
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 23;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 295]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 393
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 394
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 24;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 23;
cmp_index_ref_load = 23;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[23]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 24;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((48 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 395
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 395
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 395
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 24;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 24;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 393
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 393
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 397
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((52 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 24;
cmp_index_ref_load = 24;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[24]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 397
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 397
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 296];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 60],&circuitConstants[42]); // line circom 402
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 25;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 296]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 404
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 405
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 25;
cmp_index_ref_load = 25;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[25]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((52 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 406
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 406
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 406
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 404
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 404
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 408
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((56 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 26;
cmp_index_ref_load = 26;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[26]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 408
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 408
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 297];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 64],&circuitConstants[44]); // line circom 413
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 27;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 297]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 415
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 416
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 28;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 27;
cmp_index_ref_load = 27;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[27]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 28;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((56 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 417
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 417
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 417
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 28;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 28;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 415
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 415
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 419
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((60 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 28;
cmp_index_ref_load = 28;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[28]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 419
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 419
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 298];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 68],&circuitConstants[46]); // line circom 424
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 29;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 298]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 426
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 427
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 30;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 29;
cmp_index_ref_load = 29;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[29]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 30;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((60 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 428
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 428
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 428
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 30;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 30;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 426
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 426
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 430
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((64 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 30;
cmp_index_ref_load = 30;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[30]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 430
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 430
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 299];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 72],&circuitConstants[48]); // line circom 435
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 31;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 299]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 437
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 438
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 32;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 31;
cmp_index_ref_load = 31;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[31]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 32;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((64 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 439
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 439
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 439
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 32;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 32;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 437
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 437
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 441
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((68 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 32;
cmp_index_ref_load = 32;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[32]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 441
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 441
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 300];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 76],&circuitConstants[50]); // line circom 446
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 33;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 300]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 448
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 449
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 34;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 33;
cmp_index_ref_load = 33;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[33]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 34;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((68 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 450
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 450
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 450
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 34;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 34;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 448
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 448
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 452
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((72 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 34;
cmp_index_ref_load = 34;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[34]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 452
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 452
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 301];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 80],&circuitConstants[52]); // line circom 457
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 35;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 301]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 459
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 460
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 36;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 35;
cmp_index_ref_load = 35;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[35]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 36;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((72 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 461
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 461
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 461
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 36;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 36;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 459
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 459
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 463
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((76 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 36;
cmp_index_ref_load = 36;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[36]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 463
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 463
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 302];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 84],&circuitConstants[54]); // line circom 468
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 37;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 302]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 470
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 471
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 38;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 37;
cmp_index_ref_load = 37;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[37]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 38;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((76 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 472
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 472
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 472
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 38;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 38;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 470
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 470
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 474
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((80 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 38;
cmp_index_ref_load = 38;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[38]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 474
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 474
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 303];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 88],&circuitConstants[56]); // line circom 479
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 39;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 303]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 481
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 482
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 40;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 39;
cmp_index_ref_load = 39;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[39]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 40;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((80 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 483
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 483
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 483
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 40;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 40;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 481
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 481
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 485
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((84 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 40;
cmp_index_ref_load = 40;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[40]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 485
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 485
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 304];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 92],&circuitConstants[58]); // line circom 490
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 41;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 304]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 492
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 493
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 42;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 41;
cmp_index_ref_load = 41;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[41]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 42;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((84 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 494
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 494
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 494
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 42;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 42;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 492
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 492
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 496
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((88 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 42;
cmp_index_ref_load = 42;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[42]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 496
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 496
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 305];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 96],&circuitConstants[60]); // line circom 501
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 43;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 305]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 503
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 504
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 44;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 43;
cmp_index_ref_load = 43;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[43]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 44;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((88 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 505
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 505
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 505
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 44;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 44;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 503
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 503
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 507
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((92 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 44;
cmp_index_ref_load = 44;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[44]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 507
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 507
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 306];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 100],&circuitConstants[62]); // line circom 512
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 45;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 306]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 514
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 515
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 46;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 45;
cmp_index_ref_load = 45;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[45]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 46;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((92 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 516
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 516
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 516
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 46;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 46;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 514
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 514
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 518
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((96 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 46;
cmp_index_ref_load = 46;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[46]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 518
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 518
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 307];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 104],&circuitConstants[64]); // line circom 523
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 47;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 307]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 525
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 526
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 48;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 47;
cmp_index_ref_load = 47;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[47]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 48;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((96 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 527
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 527
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 527
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 48;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 48;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 525
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 525
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 529
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((100 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 48;
cmp_index_ref_load = 48;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[48]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 529
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 529
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 308];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 108],&circuitConstants[66]); // line circom 534
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 49;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 308]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 536
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 537
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 50;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 49;
cmp_index_ref_load = 49;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[49]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 50;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((100 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 538
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 538
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 538
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 50;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 50;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 536
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 536
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 540
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((104 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 50;
cmp_index_ref_load = 50;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[50]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 540
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 540
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 309];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 112],&circuitConstants[68]); // line circom 545
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 51;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 309]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 547
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 548
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 52;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 51;
cmp_index_ref_load = 51;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[51]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 52;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((104 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 549
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 549
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 549
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 52;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 52;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 547
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 547
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 551
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((108 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 52;
cmp_index_ref_load = 52;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[52]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 551
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 551
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 310];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 116],&circuitConstants[70]); // line circom 556
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 53;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 310]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 558
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 559
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 54;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 53;
cmp_index_ref_load = 53;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[53]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 54;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((108 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 560
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 560
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 560
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 54;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 54;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 558
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 558
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 562
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((112 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 54;
cmp_index_ref_load = 54;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[54]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 562
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 562
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 311];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 120],&circuitConstants[72]); // line circom 567
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 55;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 311]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 569
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 570
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 56;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 55;
cmp_index_ref_load = 55;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[55]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 56;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((112 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 571
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 571
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 571
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 56;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 56;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 569
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 569
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 573
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((116 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 56;
cmp_index_ref_load = 56;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[56]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 573
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 573
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 312];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 124],&circuitConstants[74]); // line circom 578
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 57;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 312]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 580
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 581
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 58;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 57;
cmp_index_ref_load = 57;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[57]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 58;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((116 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 582
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 582
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 582
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 58;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 58;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 580
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 580
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 584
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((120 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 58;
cmp_index_ref_load = 58;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[58]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 584
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 584
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 313];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 128],&circuitConstants[76]); // line circom 589
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 59;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 313]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 591
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 592
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 60;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 59;
cmp_index_ref_load = 59;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[59]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 60;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((120 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 593
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 593
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 593
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 60;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 60;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 591
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 591
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 595
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((124 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 60;
cmp_index_ref_load = 60;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[60]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 595
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 595
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 314];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 132],&circuitConstants[78]); // line circom 600
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 61;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 314]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 602
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 603
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 62;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 61;
cmp_index_ref_load = 61;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[61]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 62;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((124 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 604
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 604
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 604
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 62;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 62;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 602
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 602
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 606
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((128 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 62;
cmp_index_ref_load = 62;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[62]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 606
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 606
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 315];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 136],&circuitConstants[80]); // line circom 611
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 63;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 315]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 613
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 614
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 64;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 63;
cmp_index_ref_load = 63;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[63]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 64;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((128 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 615
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 615
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 615
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 64;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 64;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 613
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 613
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 617
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((132 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 64;
cmp_index_ref_load = 64;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[64]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 617
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 617
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 316];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 140],&circuitConstants[82]); // line circom 622
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 65;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 316]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 624
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 625
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 66;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 65;
cmp_index_ref_load = 65;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[65]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 66;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((132 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 626
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 626
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 626
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 66;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 66;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 624
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 624
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 628
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((136 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 66;
cmp_index_ref_load = 66;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[66]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 628
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 628
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 317];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 144],&circuitConstants[84]); // line circom 633
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 67;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 317]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 635
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 636
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 68;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 67;
cmp_index_ref_load = 67;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[67]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 68;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((136 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 637
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 637
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 637
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 68;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 68;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 635
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 635
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 639
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((140 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 68;
cmp_index_ref_load = 68;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[68]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 639
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 639
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 318];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 148],&circuitConstants[86]); // line circom 644
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 69;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 318]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 646
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 647
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 70;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 69;
cmp_index_ref_load = 69;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[69]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 70;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((140 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 648
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 648
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 648
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 70;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 70;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 646
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 646
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 650
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((144 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 70;
cmp_index_ref_load = 70;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[70]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 650
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 650
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 319];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 152],&circuitConstants[88]); // line circom 655
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 71;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 319]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 657
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 658
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 72;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 71;
cmp_index_ref_load = 71;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[71]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 72;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((144 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 659
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 659
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 659
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 72;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 72;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 657
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 657
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 661
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((148 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 72;
cmp_index_ref_load = 72;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[72]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 661
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 661
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 320];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 156],&circuitConstants[90]); // line circom 666
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 73;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 320]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 668
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 669
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 74;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 73;
cmp_index_ref_load = 73;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[73]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 74;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((148 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 670
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 670
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 670
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 74;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 74;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 668
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 668
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 672
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((152 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 74;
cmp_index_ref_load = 74;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[74]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 672
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 672
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 321];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 160],&circuitConstants[92]); // line circom 677
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 75;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 321]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 679
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 680
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 76;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 75;
cmp_index_ref_load = 75;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[75]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 76;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((152 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 681
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 681
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 681
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 76;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 76;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 679
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 679
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 683
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((156 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 76;
cmp_index_ref_load = 76;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[76]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 683
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 683
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 322];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 164],&circuitConstants[94]); // line circom 688
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 77;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 322]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 690
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 691
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 78;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 77;
cmp_index_ref_load = 77;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[77]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 78;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((156 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 692
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 692
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 692
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 78;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 78;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 690
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 690
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 694
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((160 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 78;
cmp_index_ref_load = 78;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[78]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 694
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 694
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 323];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 168],&circuitConstants[96]); // line circom 699
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 79;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 323]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 701
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 702
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 80;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 79;
cmp_index_ref_load = 79;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[79]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 80;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((160 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 703
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 703
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 703
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 80;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 80;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 701
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 701
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 705
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((164 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 80;
cmp_index_ref_load = 80;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[80]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 705
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 705
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 324];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 172],&circuitConstants[98]); // line circom 710
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 81;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 324]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 712
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 713
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 82;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 81;
cmp_index_ref_load = 81;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[81]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 82;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((164 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 714
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 714
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 714
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 82;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 82;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 712
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 712
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 716
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((168 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 82;
cmp_index_ref_load = 82;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[82]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 716
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 716
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 325];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 176],&circuitConstants[100]); // line circom 721
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 83;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 325]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 723
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 724
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 84;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 83;
cmp_index_ref_load = 83;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[83]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 84;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((168 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 725
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 725
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 725
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 84;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 84;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 723
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 723
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 727
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((172 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 84;
cmp_index_ref_load = 84;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[84]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 727
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 727
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 326];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 180],&circuitConstants[102]); // line circom 732
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 85;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 326]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 734
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 735
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 86;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 85;
cmp_index_ref_load = 85;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[85]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 86;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((172 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 736
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 736
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 736
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 86;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 86;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 734
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 734
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 738
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((176 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 86;
cmp_index_ref_load = 86;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[86]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 738
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 738
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 327];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 184],&circuitConstants[104]); // line circom 743
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 87;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 327]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 745
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 746
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 88;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 87;
cmp_index_ref_load = 87;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[87]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 88;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((176 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 747
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 747
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 747
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 88;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 88;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 745
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 745
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 749
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((180 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 88;
cmp_index_ref_load = 88;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[88]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 749
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 749
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 328];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 188],&circuitConstants[106]); // line circom 754
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 89;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 328]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 756
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 757
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 90;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 89;
cmp_index_ref_load = 89;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[89]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 90;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((180 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 758
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 758
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 758
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 90;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 90;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 756
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 756
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 760
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((184 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 90;
cmp_index_ref_load = 90;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[90]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 760
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 760
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 329];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 192],&circuitConstants[108]); // line circom 765
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 91;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 329]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 767
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 768
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 92;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 91;
cmp_index_ref_load = 91;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[91]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 92;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((184 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 769
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 769
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 769
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 92;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 92;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 767
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 767
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 771
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((188 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 92;
cmp_index_ref_load = 92;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[92]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 771
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 771
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 330];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 196],&circuitConstants[110]); // line circom 776
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 93;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 330]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 778
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 779
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 94;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 93;
cmp_index_ref_load = 93;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[93]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 94;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((188 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 780
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 780
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 780
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 94;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 94;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 778
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 778
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 782
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((192 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 94;
cmp_index_ref_load = 94;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[94]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 782
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 782
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 331];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 200],&circuitConstants[112]); // line circom 787
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 95;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 331]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 789
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 790
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 96;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 95;
cmp_index_ref_load = 95;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[95]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 96;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((192 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 791
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 791
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 791
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 96;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 96;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 789
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 789
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 793
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((196 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 96;
cmp_index_ref_load = 96;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[96]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 793
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 793
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 332];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 204],&circuitConstants[114]); // line circom 798
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 97;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 332]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 800
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 801
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 98;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 97;
cmp_index_ref_load = 97;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[97]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 98;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((196 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 802
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 802
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 802
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 98;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 98;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 800
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 800
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 804
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((200 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 98;
cmp_index_ref_load = 98;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[98]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 804
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 804
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 333];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 208],&circuitConstants[116]); // line circom 809
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 99;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 333]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 811
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 812
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 100;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 99;
cmp_index_ref_load = 99;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[99]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 100;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((200 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 813
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 813
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 813
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 100;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 100;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 811
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 811
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 815
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((204 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 100;
cmp_index_ref_load = 100;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[100]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 815
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 815
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 334];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 212],&circuitConstants[118]); // line circom 820
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 101;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 334]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 822
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 823
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 102;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 101;
cmp_index_ref_load = 101;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[101]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 102;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((204 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 824
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 824
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 824
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 102;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 102;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 822
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 822
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 826
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((208 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 102;
cmp_index_ref_load = 102;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[102]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 826
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 826
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 335];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 216],&circuitConstants[120]); // line circom 831
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 103;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 335]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 833
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 834
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 104;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 103;
cmp_index_ref_load = 103;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[103]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 104;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((208 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 835
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 835
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 835
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 104;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 104;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 833
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 833
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 837
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((212 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 104;
cmp_index_ref_load = 104;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[104]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 837
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 837
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 336];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 220],&circuitConstants[122]); // line circom 842
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 105;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 336]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 844
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 845
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 106;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 105;
cmp_index_ref_load = 105;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[105]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 106;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((212 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 846
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 846
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 846
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 106;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 106;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 844
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 844
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 848
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((216 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 106;
cmp_index_ref_load = 106;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[106]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 848
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 848
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 337];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 224],&circuitConstants[124]); // line circom 853
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 107;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 337]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 855
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 856
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 107;
cmp_index_ref_load = 107;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[107]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((216 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 857
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 857
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 857
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 855
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 855
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 859
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((220 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 108;
cmp_index_ref_load = 108;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[108]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 859
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 859
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 338];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 228],&circuitConstants[126]); // line circom 864
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 109;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 338]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 866
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 867
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 110;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 109;
cmp_index_ref_load = 109;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[109]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 110;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((220 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 868
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 868
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 868
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 110;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 110;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 866
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 866
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 870
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((224 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 110;
cmp_index_ref_load = 110;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[110]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 870
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 870
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 339];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 232],&circuitConstants[128]); // line circom 875
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 111;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 339]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 877
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 878
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 112;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 111;
cmp_index_ref_load = 111;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[111]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 112;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((224 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 879
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 879
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 879
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 112;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 112;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 877
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 877
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 881
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((228 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 112;
cmp_index_ref_load = 112;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[112]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 881
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 881
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 340];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 236],&circuitConstants[130]); // line circom 886
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 113;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 340]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 888
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 889
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 114;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 113;
cmp_index_ref_load = 113;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[113]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 114;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((228 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 890
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 890
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 890
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 114;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 114;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 888
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 888
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 892
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((232 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 114;
cmp_index_ref_load = 114;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[114]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 892
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 892
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 341];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 240],&circuitConstants[132]); // line circom 897
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 115;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 341]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 899
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 900
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 116;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 115;
cmp_index_ref_load = 115;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[115]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 116;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((232 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 901
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 901
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 901
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 116;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 116;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 899
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 899
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 903
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((236 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 116;
cmp_index_ref_load = 116;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[116]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 903
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 903
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 342];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 244],&circuitConstants[134]); // line circom 908
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 117;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 342]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 910
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 911
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 118;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 117;
cmp_index_ref_load = 117;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[117]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 118;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((236 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 912
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 912
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 912
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 118;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 118;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 910
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 910
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 914
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((240 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 118;
cmp_index_ref_load = 118;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[118]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 914
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 914
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 343];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 248],&circuitConstants[136]); // line circom 919
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 119;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 343]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
SingleSBox_1_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 921
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 922
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 120;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 119;
cmp_index_ref_load = 119;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[119]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}else{
{
uint cmp_index_ref = 120;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((240 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 923
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[23]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[24]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 923
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[25]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 923
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 120;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[26]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}else{
{
uint cmp_index_ref = 120;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 8)];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
InternalMatrixMultiplication_3_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 921
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 921
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 925
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((244 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 120;
cmp_index_ref_load = 120;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[120]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 925
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 925
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 931
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 932
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[138]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[139]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 932
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[140]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 932
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[141]);
}
}else{
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + ((0 + (1 * Fr_toInt(&lvar[0]))) + 344)];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + ((244 + (1 * Fr_toInt(&lvar[0]))) + 8)],&lvar[3]); // line circom 932
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 931
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 931
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 934
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 121;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((0 + (1 * Fr_toInt(&lvar[0]))) + 344)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SBox_2_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 934
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 934
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 937
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 122;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 121;
cmp_index_ref_load = 121;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[121]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MatrixMultiplication4x4_0_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 937
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 937
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 940
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((248 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 122;
cmp_index_ref_load = 122;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[122]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 940
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 940
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 945
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 946
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[143]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[144]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 946
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[145]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 946
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[146]);
}
}else{
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + ((4 + (1 * Fr_toInt(&lvar[0]))) + 344)];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + ((248 + (1 * Fr_toInt(&lvar[0]))) + 8)],&lvar[3]); // line circom 946
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 945
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 945
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 948
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 123;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((4 + (1 * Fr_toInt(&lvar[0]))) + 344)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SBox_2_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 948
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 948
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 951
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 124;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 123;
cmp_index_ref_load = 123;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[123]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MatrixMultiplication4x4_0_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 951
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 951
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 954
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((252 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 124;
cmp_index_ref_load = 124;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[124]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 954
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 954
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 959
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 960
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[148]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[149]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 960
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[150]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 960
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[151]);
}
}else{
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + ((8 + (1 * Fr_toInt(&lvar[0]))) + 344)];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + ((252 + (1 * Fr_toInt(&lvar[0]))) + 8)],&lvar[3]); // line circom 960
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 959
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 959
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 962
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 125;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((8 + (1 * Fr_toInt(&lvar[0]))) + 344)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SBox_2_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 962
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 962
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 965
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 126;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 125;
cmp_index_ref_load = 125;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[125]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MatrixMultiplication4x4_0_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 965
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 965
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 968
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((256 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 126;
cmp_index_ref_load = 126;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[126]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 968
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 968
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 973
while(Fr_isTrue(&expaux[0])){
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[2]); // line circom 974
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[153]);
}
}else{
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[154]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 974
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[155]);
}
}else{
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
}
{{
Fr_eq(&expaux[0],&lvar[0],&circuitConstants[0]); // line circom 974
}}
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[156]);
}
}else{
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&lvar[2]);
}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + ((12 + (1 * Fr_toInt(&lvar[0]))) + 344)];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + ((256 + (1 * Fr_toInt(&lvar[0]))) + 8)],&lvar[3]); // line circom 974
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 973
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 973
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 976
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 127;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((12 + (1 * Fr_toInt(&lvar[0]))) + 344)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SBox_2_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 976
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 976
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 979
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 128;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
cmp_index_ref_load = 127;
cmp_index_ref_load = 127;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[127]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MatrixMultiplication4x4_0_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 979
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 979
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 982
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((260 + (1 * Fr_toInt(&lvar[0]))) + 8)];
// load src
cmp_index_ref_load = 128;
cmp_index_ref_load = 128;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[128]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 982
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 982
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 987
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[0])) + 0)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((260 + (1 * Fr_toInt(&lvar[0]))) + 8)]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 987
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[4]); // line circom 987
}
for (uint i = 0; i < 129; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Poseidon2Hash3_5_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 5;
ctx->componentMemory[coffset].templateName = "Poseidon2Hash3";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 3;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[1]{0};
}

void Poseidon2Hash3_5_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[3];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "perm";
Poseidon2Permutation_4_create(mySignalStart+9,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[3]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[158]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[159]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 5];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 1]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 6];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 7];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 3]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 8];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 4]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[2],&circuitConstants[4]); // line circom 1071
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[2])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[2])) + 5)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
Poseidon2Permutation_4_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&circuitConstants[1]); // line circom 1071
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[2],&circuitConstants[4]); // line circom 1071
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]);
}
for (uint i = 0; i < 1; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Poseidon2Hash2_6_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 6;
ctx->componentMemory[coffset].templateName = "Poseidon2Hash2";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 2;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[1]{0};
}

void Poseidon2Hash2_6_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[3];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "perm";
Poseidon2Permutation_4_create(mySignalStart+8,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[3]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[158]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[160]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 1]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 5];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 6];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 7];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 3]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[2],&circuitConstants[4]); // line circom 1042
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[2])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[2])) + 4)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
Poseidon2Permutation_4_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&circuitConstants[1]); // line circom 1042
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[2],&circuitConstants[4]); // line circom 1042
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]);
}
for (uint i = 0; i < 1; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Num2Bits_7_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 7;
ctx->componentMemory[coffset].templateName = "Num2Bits";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Num2Bits_7_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[161]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[161]); // line circom 31
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)];
// load src
Fr_shr(&expaux[1],&signalValues[mySignalStart + 128],&lvar[3]); // line circom 32
Fr_band(&expaux[0],&expaux[1],&circuitConstants[1]); // line circom 32
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_sub(&expaux[2],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&circuitConstants[1]); // line circom 33
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&expaux[2]); // line circom 33
{{
Fr_eq(&expaux[0],&expaux[1],&circuitConstants[0]); // line circom 33
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 33. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&lvar[2]); // line circom 34
Fr_add(&expaux[0],&lvar[1],&expaux[1]); // line circom 34
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&lvar[2]); // line circom 35
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
Fr_add(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 31
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[161]); // line circom 31
}
{
{{
Fr_eq(&expaux[0],&lvar[1],&signalValues[mySignalStart + 128]); // line circom 38
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 38. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Num2Bits_8_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 8;
ctx->componentMemory[coffset].templateName = "Num2Bits";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Num2Bits_8_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[162]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[162]); // line circom 31
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)];
// load src
Fr_shr(&expaux[1],&signalValues[mySignalStart + 254],&lvar[3]); // line circom 32
Fr_band(&expaux[0],&expaux[1],&circuitConstants[1]); // line circom 32
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_sub(&expaux[2],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&circuitConstants[1]); // line circom 33
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&expaux[2]); // line circom 33
{{
Fr_eq(&expaux[0],&expaux[1],&circuitConstants[0]); // line circom 33
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 33. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&lvar[2]); // line circom 34
Fr_add(&expaux[0],&lvar[1],&expaux[1]); // line circom 34
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&lvar[2]); // line circom 35
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
Fr_add(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 31
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[162]); // line circom 31
}
{
{{
Fr_eq(&expaux[0],&lvar[1],&signalValues[mySignalStart + 254]); // line circom 38
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 38. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Num2Bits_9_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 9;
ctx->componentMemory[coffset].templateName = "Num2Bits";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Num2Bits_9_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[63]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[63]); // line circom 31
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)];
// load src
Fr_shr(&expaux[1],&signalValues[mySignalStart + 24],&lvar[3]); // line circom 32
Fr_band(&expaux[0],&expaux[1],&circuitConstants[1]); // line circom 32
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_sub(&expaux[2],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&circuitConstants[1]); // line circom 33
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&expaux[2]); // line circom 33
{{
Fr_eq(&expaux[0],&expaux[1],&circuitConstants[0]); // line circom 33
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 33. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&lvar[2]); // line circom 34
Fr_add(&expaux[0],&lvar[1],&expaux[1]); // line circom 34
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&lvar[2]); // line circom 35
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
Fr_add(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 31
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[63]); // line circom 31
}
{
{{
Fr_eq(&expaux[0],&lvar[1],&signalValues[mySignalStart + 24]); // line circom 38
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 38. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void IsZero_10_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 10;
ctx->componentMemory[coffset].templateName = "IsZero";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void IsZero_10_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[3];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
Fr_neq(&expaux[0],&signalValues[mySignalStart + 1],&circuitConstants[0]); // line circom 30
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
Fr_div(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 1]); // line circom 30
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
}else{
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
Fr_neg(&expaux[2],&signalValues[mySignalStart + 1]); // line circom 32
Fr_mul(&expaux[1],&expaux[2],&signalValues[mySignalStart + 2]); // line circom 32
Fr_add(&expaux[0],&expaux[1],&circuitConstants[1]); // line circom 32
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_mul(&expaux[1],&signalValues[mySignalStart + 1],&signalValues[mySignalStart + 0]); // line circom 33
{{
Fr_eq(&expaux[0],&expaux[1],&circuitConstants[0]); // line circom 33
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 33. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Edwards2Montgomery_11_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 11;
ctx->componentMemory[coffset].templateName = "Edwards2Montgomery";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 2;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Edwards2Montgomery_11_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
Fr_add(&expaux[1],&circuitConstants[1],&signalValues[mySignalStart + 3]); // line circom 34
Fr_sub(&expaux[2],&circuitConstants[1],&signalValues[mySignalStart + 3]); // line circom 34
Fr_div(&expaux[0],&expaux[1],&expaux[2]); // line circom 34
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
Fr_div(&expaux[0],&signalValues[mySignalStart + 0],&signalValues[mySignalStart + 2]); // line circom 35
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_sub(&expaux[2],&circuitConstants[1],&signalValues[mySignalStart + 3]); // line circom 38
Fr_mul(&expaux[1],&signalValues[mySignalStart + 0],&expaux[2]); // line circom 38
Fr_add(&expaux[2],&circuitConstants[1],&signalValues[mySignalStart + 3]); // line circom 38
{{
Fr_eq(&expaux[0],&expaux[1],&expaux[2]); // line circom 38
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 38. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
Fr_mul(&expaux[1],&signalValues[mySignalStart + 1],&signalValues[mySignalStart + 2]); // line circom 39
{{
Fr_eq(&expaux[0],&expaux[1],&signalValues[mySignalStart + 0]); // line circom 39
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 39. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void MontgomeryDouble_12_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 12;
ctx->componentMemory[coffset].templateName = "MontgomeryDouble";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 2;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void MontgomeryDouble_12_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[7];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[163]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[164]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[165]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 5];
// load src
Fr_mul(&expaux[0],&signalValues[mySignalStart + 2],&signalValues[mySignalStart + 2]); // line circom 135
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 4];
// load src
Fr_mul(&expaux[3],&circuitConstants[3],&signalValues[mySignalStart + 5]); // line circom 137
Fr_mul(&expaux[4],&circuitConstants[166],&signalValues[mySignalStart + 2]); // line circom 137
Fr_add(&expaux[2],&expaux[3],&expaux[4]); // line circom 137
Fr_add(&expaux[1],&expaux[2],&circuitConstants[1]); // line circom 137
Fr_mul(&expaux[2],&circuitConstants[2],&signalValues[mySignalStart + 3]); // line circom 137
Fr_div(&expaux[0],&expaux[1],&expaux[2]); // line circom 137
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_mul(&expaux[2],&circuitConstants[2],&signalValues[mySignalStart + 3]); // line circom 138
Fr_mul(&expaux[1],&signalValues[mySignalStart + 4],&expaux[2]); // line circom 138
Fr_mul(&expaux[4],&circuitConstants[3],&signalValues[mySignalStart + 5]); // line circom 138
Fr_mul(&expaux[5],&circuitConstants[166],&signalValues[mySignalStart + 2]); // line circom 138
Fr_add(&expaux[3],&expaux[4],&expaux[5]); // line circom 138
Fr_add(&expaux[2],&expaux[3],&circuitConstants[1]); // line circom 138
{{
Fr_eq(&expaux[0],&expaux[1],&expaux[2]); // line circom 138
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 138. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
Fr_mul(&expaux[3],&circuitConstants[1],&signalValues[mySignalStart + 4]); // line circom 140
Fr_mul(&expaux[2],&expaux[3],&signalValues[mySignalStart + 4]); // line circom 140
Fr_sub(&expaux[1],&expaux[2],&circuitConstants[165]); // line circom 140
Fr_mul(&expaux[2],&circuitConstants[2],&signalValues[mySignalStart + 2]); // line circom 140
Fr_sub(&expaux[0],&expaux[1],&expaux[2]); // line circom 140
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
Fr_sub(&expaux[2],&signalValues[mySignalStart + 2],&signalValues[mySignalStart + 0]); // line circom 141
Fr_mul(&expaux[1],&signalValues[mySignalStart + 4],&expaux[2]); // line circom 141
Fr_sub(&expaux[0],&expaux[1],&signalValues[mySignalStart + 3]); // line circom 141
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void MontgomeryAdd_13_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 13;
ctx->componentMemory[coffset].templateName = "MontgomeryAdd";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 4;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void MontgomeryAdd_13_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[6];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[163]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[164]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[165]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 6];
// load src
Fr_sub(&expaux[1],&signalValues[mySignalStart + 5],&signalValues[mySignalStart + 3]); // line circom 102
Fr_sub(&expaux[2],&signalValues[mySignalStart + 4],&signalValues[mySignalStart + 2]); // line circom 102
Fr_div(&expaux[0],&expaux[1],&expaux[2]); // line circom 102
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_sub(&expaux[2],&signalValues[mySignalStart + 4],&signalValues[mySignalStart + 2]); // line circom 103
Fr_mul(&expaux[1],&signalValues[mySignalStart + 6],&expaux[2]); // line circom 103
Fr_sub(&expaux[2],&signalValues[mySignalStart + 5],&signalValues[mySignalStart + 3]); // line circom 103
{{
Fr_eq(&expaux[0],&expaux[1],&expaux[2]); // line circom 103
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 103. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
Fr_mul(&expaux[4],&circuitConstants[1],&signalValues[mySignalStart + 6]); // line circom 105
Fr_mul(&expaux[3],&expaux[4],&signalValues[mySignalStart + 6]); // line circom 105
Fr_sub(&expaux[2],&expaux[3],&circuitConstants[165]); // line circom 105
Fr_sub(&expaux[1],&expaux[2],&signalValues[mySignalStart + 2]); // line circom 105
Fr_sub(&expaux[0],&expaux[1],&signalValues[mySignalStart + 4]); // line circom 105
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
Fr_sub(&expaux[2],&signalValues[mySignalStart + 2],&signalValues[mySignalStart + 0]); // line circom 106
Fr_mul(&expaux[1],&signalValues[mySignalStart + 6],&expaux[2]); // line circom 106
Fr_sub(&expaux[0],&expaux[1],&signalValues[mySignalStart + 3]); // line circom 106
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Multiplexor2_14_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 14;
ctx->componentMemory[coffset].templateName = "Multiplexor2";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 5;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Multiplexor2_14_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[3];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
Fr_sub(&expaux[2],&signalValues[mySignalStart + 5],&signalValues[mySignalStart + 3]); // line circom 30
Fr_mul(&expaux[1],&expaux[2],&signalValues[mySignalStart + 2]); // line circom 30
Fr_add(&expaux[0],&expaux[1],&signalValues[mySignalStart + 3]); // line circom 30
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
Fr_sub(&expaux[2],&signalValues[mySignalStart + 6],&signalValues[mySignalStart + 4]); // line circom 31
Fr_mul(&expaux[1],&expaux[2],&signalValues[mySignalStart + 2]); // line circom 31
Fr_add(&expaux[0],&expaux[1],&signalValues[mySignalStart + 4]); // line circom 31
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void BitElementMulAny_15_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 15;
ctx->componentMemory[coffset].templateName = "BitElementMulAny";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 5;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[3]{0};
}

void BitElementMulAny_15_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[1];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "doubler";
MontgomeryDouble_12_create(mySignalStart+16,1+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 1+ctx_index+1;
}
{
std::string new_cmp_name = "adder";
MontgomeryAdd_13_create(mySignalStart+9,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 0+ctx_index+1;
}
{
std::string new_cmp_name = "selector";
Multiplexor2_14_create(mySignalStart+22,2+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[2] = 2+ctx_index+1;
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 4]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 5]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 6]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
MontgomeryDouble_12_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 7]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 8]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
MontgomeryAdd_13_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 7]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 8]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Multiplexor2_14_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 1]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 3];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + 1]);
}
for (uint i = 0; i < 3; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Montgomery2Edwards_16_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 16;
ctx->componentMemory[coffset].templateName = "Montgomery2Edwards";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 2;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Montgomery2Edwards_16_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
Fr_div(&expaux[0],&signalValues[mySignalStart + 2],&signalValues[mySignalStart + 3]); // line circom 53
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
Fr_sub(&expaux[1],&signalValues[mySignalStart + 2],&circuitConstants[1]); // line circom 54
Fr_add(&expaux[2],&signalValues[mySignalStart + 2],&circuitConstants[1]); // line circom 54
Fr_div(&expaux[0],&expaux[1],&expaux[2]); // line circom 54
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_mul(&expaux[1],&signalValues[mySignalStart + 0],&signalValues[mySignalStart + 3]); // line circom 56
{{
Fr_eq(&expaux[0],&expaux[1],&signalValues[mySignalStart + 2]); // line circom 56
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 56. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
Fr_add(&expaux[2],&signalValues[mySignalStart + 2],&circuitConstants[1]); // line circom 57
Fr_mul(&expaux[1],&signalValues[mySignalStart + 1],&expaux[2]); // line circom 57
Fr_sub(&expaux[2],&signalValues[mySignalStart + 2],&circuitConstants[1]); // line circom 57
{{
Fr_eq(&expaux[0],&expaux[1],&expaux[2]); // line circom 57
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 57. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void BabyAdd_17_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 17;
ctx->componentMemory[coffset].templateName = "BabyAdd";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 4;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void BabyAdd_17_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[6];
FrElement lvar[2];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[163]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[164]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 6];
// load src
Fr_mul(&expaux[0],&signalValues[mySignalStart + 2],&signalValues[mySignalStart + 5]); // line circom 40
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 7];
// load src
Fr_mul(&expaux[0],&signalValues[mySignalStart + 3],&signalValues[mySignalStart + 4]); // line circom 41
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 8];
// load src
Fr_mul(&expaux[2],&circuitConstants[167],&signalValues[mySignalStart + 2]); // line circom 42
Fr_add(&expaux[1],&expaux[2],&signalValues[mySignalStart + 3]); // line circom 42
Fr_add(&expaux[2],&signalValues[mySignalStart + 4],&signalValues[mySignalStart + 5]); // line circom 42
Fr_mul(&expaux[0],&expaux[1],&expaux[2]); // line circom 42
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 9];
// load src
Fr_mul(&expaux[0],&signalValues[mySignalStart + 6],&signalValues[mySignalStart + 7]); // line circom 43
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
Fr_add(&expaux[1],&signalValues[mySignalStart + 6],&signalValues[mySignalStart + 7]); // line circom 45
Fr_mul(&expaux[4],&circuitConstants[164],&signalValues[mySignalStart + 9]); // line circom 45
Fr_add(&expaux[2],&circuitConstants[1],&expaux[4]); // line circom 45
Fr_div(&expaux[0],&expaux[1],&expaux[2]); // line circom 45
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_mul(&expaux[4],&circuitConstants[164],&signalValues[mySignalStart + 9]); // line circom 46
Fr_add(&expaux[2],&circuitConstants[1],&expaux[4]); // line circom 46
Fr_mul(&expaux[1],&expaux[2],&signalValues[mySignalStart + 0]); // line circom 46
Fr_add(&expaux[2],&signalValues[mySignalStart + 6],&signalValues[mySignalStart + 7]); // line circom 46
{{
Fr_eq(&expaux[0],&expaux[1],&expaux[2]); // line circom 46
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 46. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
Fr_mul(&expaux[3],&circuitConstants[163],&signalValues[mySignalStart + 6]); // line circom 48
Fr_add(&expaux[2],&signalValues[mySignalStart + 8],&expaux[3]); // line circom 48
Fr_sub(&expaux[1],&expaux[2],&signalValues[mySignalStart + 7]); // line circom 48
Fr_mul(&expaux[4],&circuitConstants[164],&signalValues[mySignalStart + 9]); // line circom 48
Fr_sub(&expaux[2],&circuitConstants[1],&expaux[4]); // line circom 48
Fr_div(&expaux[0],&expaux[1],&expaux[2]); // line circom 48
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_mul(&expaux[4],&circuitConstants[164],&signalValues[mySignalStart + 9]); // line circom 49
Fr_sub(&expaux[2],&circuitConstants[1],&expaux[4]); // line circom 49
Fr_mul(&expaux[1],&expaux[2],&signalValues[mySignalStart + 1]); // line circom 49
Fr_mul(&expaux[4],&circuitConstants[163],&signalValues[mySignalStart + 6]); // line circom 49
Fr_add(&expaux[3],&signalValues[mySignalStart + 8],&expaux[4]); // line circom 49
Fr_sub(&expaux[2],&expaux[3],&signalValues[mySignalStart + 7]); // line circom 49
{{
Fr_eq(&expaux[0],&expaux[1],&expaux[2]); // line circom 49
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 49. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void SegmentMulAny_18_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 18;
ctx->componentMemory[coffset].templateName = "SegmentMulAny";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 130;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[131]{0};
}

void SegmentMulAny_18_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[2];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[161]);
}
{
uint aux_create = 0;
int aux_cmp_num = 0+ctx_index+1;
uint csoffset = mySignalStart+134;
uint aux_dimensions[1] = {127};
for (uint i = 0; i < 127; i++) {
std::string new_cmp_name = "bits"+ctx->generate_position_array(aux_dimensions, 1, i);
BitElementMulAny_15_create(csoffset,aux_cmp_num,ctx,new_cmp_name,myId);
mySubcomponents[aux_create+ i] = aux_cmp_num;
csoffset += 29 ;
aux_cmp_num += 4;
}
}
{
std::string new_cmp_name = "e2m";
Edwards2Montgomery_11_create(mySignalStart+3817,508+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[127] = 508+ctx_index+1;
}
{
std::string new_cmp_name = "m2e";
Montgomery2Edwards_16_create(mySignalStart+3838,511+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[128] = 511+ctx_index+1;
}
{
std::string new_cmp_name = "eadder";
BabyAdd_17_create(mySignalStart+3821,509+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[129] = 509+ctx_index+1;
}
{
std::string new_cmp_name = "lastSel";
Multiplexor2_14_create(mySignalStart+3831,510+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[130] = 510+ctx_index+1;
}
{
uint cmp_index_ref = 127;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 132]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 127;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 133]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Edwards2Montgomery_11_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 127;
cmp_index_ref_load = 127;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[127]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
cmp_index_ref_load = 127;
cmp_index_ref_load = 127;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[127]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 7];
// load src
cmp_index_ref_load = 127;
cmp_index_ref_load = 127;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[127]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 8];
// load src
cmp_index_ref_load = 127;
cmp_index_ref_load = 127;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[127]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 5]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
Fr_lt(&expaux[0],&lvar[1],&circuitConstants[168]); // line circom 92
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 95
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 96
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 7];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 97
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 8];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 98
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 3]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * (Fr_toInt(&lvar[1]) + 1)) + 4)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_add(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 92
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[1],&circuitConstants[168]); // line circom 92
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
cmp_index_ref_load = 126;
cmp_index_ref_load = 126;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[126]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 3];
// load src
cmp_index_ref_load = 126;
cmp_index_ref_load = 126;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[126]].signalStart + 1]);
}
{
uint cmp_index_ref = 128;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 126;
cmp_index_ref_load = 126;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[126]].signalStart + 2]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 128;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 126;
cmp_index_ref_load = 126;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[126]].signalStart + 3]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Montgomery2Edwards_16_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 129;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 128;
cmp_index_ref_load = 128;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[128]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 129;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 128;
cmp_index_ref_load = 128;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[128]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 129;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
Fr_neg(&expaux[0],&signalValues[mySignalStart + 132]); // line circom 114
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 129;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 133]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 130;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 4]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 130;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 129;
cmp_index_ref_load = 129;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[129]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 130;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 129;
cmp_index_ref_load = 129;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[129]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 130;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 128;
cmp_index_ref_load = 128;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[128]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 130;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
cmp_index_ref_load = 128;
cmp_index_ref_load = 128;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[128]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Multiplexor2_14_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 130;
cmp_index_ref_load = 130;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[130]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 130;
cmp_index_ref_load = 130;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[130]].signalStart + 1]);
}
for (uint i = 0; i < 131; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void EscalarMulAny_19_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 19;
ctx->componentMemory[coffset].templateName = "EscalarMulAny";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 130;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[2]{0};
}

void EscalarMulAny_19_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[6];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[161]);
}
{
std::string new_cmp_name = "segments";
SegmentMulAny_18_create(mySignalStart+132,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
std::string new_cmp_name = "zeropoint";
IsZero_10_create(mySignalStart+3974,513+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 513+ctx_index+1;
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[161]);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 130]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[4];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[5];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 150
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[5];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[161]);
}
{
PFrElement aux_dest = &lvar[4];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[4],&circuitConstants[161]); // line circom 156
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[4])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * (0 + Fr_toInt(&lvar[4]))) + 2)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SegmentMulAny_18_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[4];
// load src
Fr_add(&expaux[0],&lvar[4],&circuitConstants[1]); // line circom 156
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[4],&circuitConstants[161]); // line circom 156
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 132];
// load src
Fr_sub(&expaux[2],&circuitConstants[170],&signalValues[mySignalStart + 130]); // line circom 162
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
Fr_mul(&expaux[1],&expaux[2],&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]); // line circom 162
Fr_add(&expaux[0],&signalValues[mySignalStart + 130],&expaux[1]); // line circom 162
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SegmentMulAny_18_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 133];
// load src
Fr_sub(&expaux[2],&circuitConstants[171],&signalValues[mySignalStart + 131]); // line circom 163
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
Fr_mul(&expaux[1],&expaux[2],&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]); // line circom 163
Fr_add(&expaux[0],&signalValues[mySignalStart + 131],&expaux[1]); // line circom 163
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SegmentMulAny_18_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 150
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
Fr_sub(&expaux[1],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]); // line circom 191
Fr_mul(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0],&expaux[1]); // line circom 191
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
Fr_sub(&expaux[2],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 1]); // line circom 192
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
Fr_mul(&expaux[1],&expaux[2],&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]); // line circom 192
Fr_add(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 1],&expaux[1]); // line circom 192
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 2; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void SegmentMulAny_20_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 20;
ctx->componentMemory[coffset].templateName = "SegmentMulAny";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 150;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[151]{0};
}

void SegmentMulAny_20_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[2];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[172]);
}
{
uint aux_create = 0;
int aux_cmp_num = 0+ctx_index+1;
uint csoffset = mySignalStart+154;
uint aux_dimensions[1] = {147};
for (uint i = 0; i < 147; i++) {
std::string new_cmp_name = "bits"+ctx->generate_position_array(aux_dimensions, 1, i);
BitElementMulAny_15_create(csoffset,aux_cmp_num,ctx,new_cmp_name,myId);
mySubcomponents[aux_create+ i] = aux_cmp_num;
csoffset += 29 ;
aux_cmp_num += 4;
}
}
{
std::string new_cmp_name = "e2m";
Edwards2Montgomery_11_create(mySignalStart+4417,588+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[147] = 588+ctx_index+1;
}
{
std::string new_cmp_name = "m2e";
Montgomery2Edwards_16_create(mySignalStart+4438,591+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[148] = 591+ctx_index+1;
}
{
std::string new_cmp_name = "eadder";
BabyAdd_17_create(mySignalStart+4421,589+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[149] = 589+ctx_index+1;
}
{
std::string new_cmp_name = "lastSel";
Multiplexor2_14_create(mySignalStart+4431,590+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[150] = 590+ctx_index+1;
}
{
uint cmp_index_ref = 147;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 152]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 147;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 153]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Edwards2Montgomery_11_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 147;
cmp_index_ref_load = 147;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[147]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
cmp_index_ref_load = 147;
cmp_index_ref_load = 147;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[147]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 7];
// load src
cmp_index_ref_load = 147;
cmp_index_ref_load = 147;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[147]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 8];
// load src
cmp_index_ref_load = 147;
cmp_index_ref_load = 147;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[147]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 5]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
Fr_lt(&expaux[0],&lvar[1],&circuitConstants[173]); // line circom 92
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 95
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 96
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 7];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 97
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 8];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 98
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 3]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * (Fr_toInt(&lvar[1]) + 1)) + 4)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_add(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 92
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[1],&circuitConstants[173]); // line circom 92
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
cmp_index_ref_load = 146;
cmp_index_ref_load = 146;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[146]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 3];
// load src
cmp_index_ref_load = 146;
cmp_index_ref_load = 146;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[146]].signalStart + 1]);
}
{
uint cmp_index_ref = 148;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 146;
cmp_index_ref_load = 146;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[146]].signalStart + 2]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 148;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 146;
cmp_index_ref_load = 146;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[146]].signalStart + 3]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Montgomery2Edwards_16_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 149;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 148;
cmp_index_ref_load = 148;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[148]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 149;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 148;
cmp_index_ref_load = 148;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[148]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 149;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
Fr_neg(&expaux[0],&signalValues[mySignalStart + 152]); // line circom 114
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 149;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 153]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 150;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 4]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 150;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 149;
cmp_index_ref_load = 149;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[149]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 150;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 149;
cmp_index_ref_load = 149;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[149]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 150;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 148;
cmp_index_ref_load = 148;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[148]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 150;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
cmp_index_ref_load = 148;
cmp_index_ref_load = 148;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[148]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Multiplexor2_14_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 150;
cmp_index_ref_load = 150;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[150]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 150;
cmp_index_ref_load = 150;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[150]].signalStart + 1]);
}
for (uint i = 0; i < 151; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void SegmentMulAny_21_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 21;
ctx->componentMemory[coffset].templateName = "SegmentMulAny";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 108;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[109]{0};
}

void SegmentMulAny_21_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[2];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[175]);
}
{
uint aux_create = 0;
int aux_cmp_num = 0+ctx_index+1;
uint csoffset = mySignalStart+112;
uint aux_dimensions[1] = {105};
for (uint i = 0; i < 105; i++) {
std::string new_cmp_name = "bits"+ctx->generate_position_array(aux_dimensions, 1, i);
BitElementMulAny_15_create(csoffset,aux_cmp_num,ctx,new_cmp_name,myId);
mySubcomponents[aux_create+ i] = aux_cmp_num;
csoffset += 29 ;
aux_cmp_num += 4;
}
}
{
std::string new_cmp_name = "e2m";
Edwards2Montgomery_11_create(mySignalStart+3157,420+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[105] = 420+ctx_index+1;
}
{
std::string new_cmp_name = "m2e";
Montgomery2Edwards_16_create(mySignalStart+3178,423+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[106] = 423+ctx_index+1;
}
{
std::string new_cmp_name = "eadder";
BabyAdd_17_create(mySignalStart+3161,421+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[107] = 421+ctx_index+1;
}
{
std::string new_cmp_name = "lastSel";
Multiplexor2_14_create(mySignalStart+3171,422+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[108] = 422+ctx_index+1;
}
{
uint cmp_index_ref = 105;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 110]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 105;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 111]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Edwards2Montgomery_11_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 105;
cmp_index_ref_load = 105;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[105]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
cmp_index_ref_load = 105;
cmp_index_ref_load = 105;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[105]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 7];
// load src
cmp_index_ref_load = 105;
cmp_index_ref_load = 105;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[105]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 8];
// load src
cmp_index_ref_load = 105;
cmp_index_ref_load = 105;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[105]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 5]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
Fr_lt(&expaux[0],&lvar[1],&circuitConstants[176]); // line circom 92
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 95
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 96
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 7];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 97
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 8];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 98
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 3]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * (Fr_toInt(&lvar[1]) + 1)) + 4)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_add(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 92
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[1],&circuitConstants[176]); // line circom 92
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
cmp_index_ref_load = 104;
cmp_index_ref_load = 104;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[104]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 3];
// load src
cmp_index_ref_load = 104;
cmp_index_ref_load = 104;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[104]].signalStart + 1]);
}
{
uint cmp_index_ref = 106;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 104;
cmp_index_ref_load = 104;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[104]].signalStart + 2]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 106;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 104;
cmp_index_ref_load = 104;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[104]].signalStart + 3]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Montgomery2Edwards_16_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 107;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 106;
cmp_index_ref_load = 106;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[106]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 107;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 106;
cmp_index_ref_load = 106;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[106]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 107;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
Fr_neg(&expaux[0],&signalValues[mySignalStart + 110]); // line circom 114
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 107;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 111]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 4]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 107;
cmp_index_ref_load = 107;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[107]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 107;
cmp_index_ref_load = 107;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[107]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 106;
cmp_index_ref_load = 106;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[106]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
cmp_index_ref_load = 106;
cmp_index_ref_load = 106;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[106]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Multiplexor2_14_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 108;
cmp_index_ref_load = 108;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[108]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 108;
cmp_index_ref_load = 108;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[108]].signalStart + 1]);
}
for (uint i = 0; i < 109; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void EscalarMulAny_22_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 22;
ctx->componentMemory[coffset].templateName = "EscalarMulAny";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 256;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[6]{0};
}

void EscalarMulAny_22_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[6];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[162]);
}
{
std::string new_cmp_name = "segments[0]";
SegmentMulAny_20_create(mySignalStart+278,3+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 3+ctx_index+1;
}
{
std::string new_cmp_name = "segments[1]";
SegmentMulAny_21_create(mySignalStart+4720,596+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 596+ctx_index+1;
}
{
std::string new_cmp_name = "doublers";
MontgomeryDouble_12_create(mySignalStart+268,1+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[2] = 1+ctx_index+1;
}
{
std::string new_cmp_name = "m2e";
Montgomery2Edwards_16_create(mySignalStart+274,2+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[3] = 2+ctx_index+1;
}
{
std::string new_cmp_name = "adders";
BabyAdd_17_create(mySignalStart+258,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[4] = 0+ctx_index+1;
}
{
std::string new_cmp_name = "zeropoint";
IsZero_10_create(mySignalStart+7902,1021+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[5] = 1021+ctx_index+1;
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[2]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[175]);
}
{
uint cmp_index_ref = 5;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 256]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[4];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[5];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[2]); // line circom 150
while(Fr_isTrue(&expaux[0])){
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 152
if(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[5];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[172]);
}
}else{
{
PFrElement aux_dest = &lvar[5];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[175]);
}
}
{
PFrElement aux_dest = &lvar[4];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[4],&lvar[5]); // line circom 156
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[3])) + 0);
{
uint map_accesses_aux[1];
{
IOFieldDef *cur_def = &(ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[2]);
{
uint map_index_aux[1];
map_index_aux[0]=Fr_toInt(&lvar[4]);
map_accesses_aux[0] = map_index_aux[0]*cur_def->size;
}
}
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[2].offset+map_accesses_aux[0]];
// load src
Fr_mul(&expaux[1],&lvar[3],&circuitConstants[172]); // line circom 157
Fr_add(&expaux[0],&expaux[1],&lvar[4]); // line circom 157
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * Fr_toInt(&expaux[0])) + 2)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
(*_functionTable[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId])(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[4];
// load src
Fr_add(&expaux[0],&lvar[4],&circuitConstants[1]); // line circom 156
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[4],&lvar[5]); // line circom 156
}
{{
Fr_eq(&expaux[0],&lvar[3],&circuitConstants[0]); // line circom 160
}}
if(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 0;
{
uint map_accesses_aux[1];
{
IOFieldDef *cur_def = &(ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[3]);
{
uint map_index_aux[1];
map_index_aux[0]=0;
map_accesses_aux[0] = map_index_aux[0]*cur_def->size;
}
}
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[3].offset+map_accesses_aux[0]];
// load src
Fr_sub(&expaux[2],&circuitConstants[170],&signalValues[mySignalStart + 256]); // line circom 162
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
Fr_mul(&expaux[1],&expaux[2],&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + 0]); // line circom 162
Fr_add(&expaux[0],&signalValues[mySignalStart + 256],&expaux[1]); // line circom 162
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
(*_functionTable[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId])(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
uint cmp_index_ref = 0;
{
uint map_accesses_aux[1];
{
IOFieldDef *cur_def = &(ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[3]);
{
uint map_index_aux[1];
map_index_aux[0]=1;
map_accesses_aux[0] = map_index_aux[0]*cur_def->size;
}
}
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[3].offset+map_accesses_aux[0]];
// load src
Fr_sub(&expaux[2],&circuitConstants[171],&signalValues[mySignalStart + 257]); // line circom 163
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
Fr_mul(&expaux[1],&expaux[2],&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + 0]); // line circom 163
Fr_add(&expaux[0],&signalValues[mySignalStart + 257],&expaux[1]); // line circom 163
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
(*_functionTable[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId])(mySubcomponents[cmp_index_ref],ctx);

}
}
}
}else{
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[0]].templateId].defs[1].offset+(0)*ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[0]].templateId].defs[1].size]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MontgomeryDouble_12_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[0]].templateId].defs[1].offset+(1)*ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[0]].templateId].defs[1].size]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
MontgomeryDouble_12_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
Montgomery2Edwards_16_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
Montgomery2Edwards_16_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 1;
{
uint map_accesses_aux[1];
{
IOFieldDef *cur_def = &(ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[3]);
{
uint map_index_aux[1];
map_index_aux[0]=0;
map_accesses_aux[0] = map_index_aux[0]*cur_def->size;
}
}
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[3].offset+map_accesses_aux[0]];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
(*_functionTable[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId])(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
uint cmp_index_ref = 1;
{
uint map_accesses_aux[1];
{
IOFieldDef *cur_def = &(ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[3]);
{
uint map_index_aux[1];
map_index_aux[0]=1;
map_accesses_aux[0] = map_index_aux[0]*cur_def->size;
}
}
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId].defs[3].offset+map_accesses_aux[0]];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
(*_functionTable[ctx->componentMemory[mySubcomponents[cmp_index_ref]].templateId])(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[0]].templateId].defs[0].offset+(0)*ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[0]].templateId].defs[0].size]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[0]].templateId].defs[0].offset+(1)*ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[0]].templateId].defs[0].size]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[1]].templateId].defs[0].offset+(0)*ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[1]].templateId].defs[0].size]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[1]].templateId].defs[0].offset+(1)*ctx->templateInsId2IOSignalInfo[ctx->componentMemory[mySubcomponents[1]].templateId].defs[0].size]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);

}
}
}
{
PFrElement aux_dest = &lvar[3];
// load src
Fr_add(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 150
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[2]); // line circom 150
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
Fr_sub(&expaux[1],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + 0]); // line circom 194
Fr_mul(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[4]].signalStart + 0],&expaux[1]); // line circom 194
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
Fr_sub(&expaux[2],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[4]].signalStart + 1]); // line circom 195
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
Fr_mul(&expaux[1],&expaux[2],&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + 0]); // line circom 195
Fr_add(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[4]].signalStart + 1],&expaux[1]); // line circom 195
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 6; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void SegmentMulAny_23_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 23;
ctx->componentMemory[coffset].templateName = "SegmentMulAny";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 26;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[27]{0};
}

void SegmentMulAny_23_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[2];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[63]);
}
{
uint aux_create = 0;
int aux_cmp_num = 0+ctx_index+1;
uint csoffset = mySignalStart+30;
uint aux_dimensions[1] = {23};
for (uint i = 0; i < 23; i++) {
std::string new_cmp_name = "bits"+ctx->generate_position_array(aux_dimensions, 1, i);
BitElementMulAny_15_create(csoffset,aux_cmp_num,ctx,new_cmp_name,myId);
mySubcomponents[aux_create+ i] = aux_cmp_num;
csoffset += 29 ;
aux_cmp_num += 4;
}
}
{
std::string new_cmp_name = "e2m";
Edwards2Montgomery_11_create(mySignalStart+697,92+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[23] = 92+ctx_index+1;
}
{
std::string new_cmp_name = "m2e";
Montgomery2Edwards_16_create(mySignalStart+718,95+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[24] = 95+ctx_index+1;
}
{
std::string new_cmp_name = "eadder";
BabyAdd_17_create(mySignalStart+701,93+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[25] = 93+ctx_index+1;
}
{
std::string new_cmp_name = "lastSel";
Multiplexor2_14_create(mySignalStart+711,94+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[26] = 94+ctx_index+1;
}
{
uint cmp_index_ref = 23;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 28]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 23;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 29]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Edwards2Montgomery_11_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 23;
cmp_index_ref_load = 23;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[23]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
cmp_index_ref_load = 23;
cmp_index_ref_load = 23;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[23]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 7];
// load src
cmp_index_ref_load = 23;
cmp_index_ref_load = 23;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[23]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 8];
// load src
cmp_index_ref_load = 23;
cmp_index_ref_load = 23;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[23]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 5]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
Fr_lt(&expaux[0],&lvar[1],&circuitConstants[61]); // line circom 92
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 95
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 96
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 1]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 7];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 97
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 2]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 8];
// load src
Fr_sub(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 98
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
cmp_index_ref_load = ((1 * Fr_toInt(&expaux[0])) + 0);
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[((1 * Fr_toInt(&expaux[0])) + 0)]].signalStart + 3]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = ((1 * Fr_toInt(&lvar[1])) + 0);
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * (Fr_toInt(&lvar[1]) + 1)) + 4)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
BitElementMulAny_15_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_add(&expaux[0],&lvar[1],&circuitConstants[1]); // line circom 92
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[1],&circuitConstants[61]); // line circom 92
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
cmp_index_ref_load = 22;
cmp_index_ref_load = 22;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[22]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 3];
// load src
cmp_index_ref_load = 22;
cmp_index_ref_load = 22;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[22]].signalStart + 1]);
}
{
uint cmp_index_ref = 24;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 22;
cmp_index_ref_load = 22;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[22]].signalStart + 2]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 24;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 22;
cmp_index_ref_load = 22;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[22]].signalStart + 3]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Montgomery2Edwards_16_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 25;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 24;
cmp_index_ref_load = 24;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[24]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 25;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 24;
cmp_index_ref_load = 24;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[24]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 25;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
Fr_neg(&expaux[0],&signalValues[mySignalStart + 28]); // line circom 114
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 25;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 29]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 4]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 25;
cmp_index_ref_load = 25;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[25]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 25;
cmp_index_ref_load = 25;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[25]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 24;
cmp_index_ref_load = 24;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[24]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 6];
// load src
cmp_index_ref_load = 24;
cmp_index_ref_load = 24;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[24]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Multiplexor2_14_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 26;
cmp_index_ref_load = 26;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[26]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 26;
cmp_index_ref_load = 26;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[26]].signalStart + 1]);
}
for (uint i = 0; i < 27; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void EscalarMulAny_24_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 24;
ctx->componentMemory[coffset].templateName = "EscalarMulAny";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 26;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[2]{0};
}

void EscalarMulAny_24_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[6];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[63]);
}
{
std::string new_cmp_name = "segments";
SegmentMulAny_23_create(mySignalStart+28,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
std::string new_cmp_name = "zeropoint";
IsZero_10_create(mySignalStart+750,97+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 97+ctx_index+1;
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[63]);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 26]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[4];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[5];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 150
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[5];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[63]);
}
{
PFrElement aux_dest = &lvar[4];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[4],&circuitConstants[63]); // line circom 156
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[4])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * (0 + Fr_toInt(&lvar[4]))) + 2)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SegmentMulAny_23_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[4];
// load src
Fr_add(&expaux[0],&lvar[4],&circuitConstants[1]); // line circom 156
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[4],&circuitConstants[63]); // line circom 156
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 28];
// load src
Fr_sub(&expaux[2],&circuitConstants[170],&signalValues[mySignalStart + 26]); // line circom 162
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
Fr_mul(&expaux[1],&expaux[2],&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]); // line circom 162
Fr_add(&expaux[0],&signalValues[mySignalStart + 26],&expaux[1]); // line circom 162
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SegmentMulAny_23_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 29];
// load src
Fr_sub(&expaux[2],&circuitConstants[171],&signalValues[mySignalStart + 27]); // line circom 163
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
Fr_mul(&expaux[1],&expaux[2],&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]); // line circom 163
Fr_add(&expaux[0],&signalValues[mySignalStart + 27],&expaux[1]); // line circom 163
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
SegmentMulAny_23_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 150
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
Fr_sub(&expaux[1],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]); // line circom 191
Fr_mul(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0],&expaux[1]); // line circom 191
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
Fr_sub(&expaux[2],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 1]); // line circom 192
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
Fr_mul(&expaux[1],&expaux[2],&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]); // line circom 192
Fr_add(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 1],&expaux[1]); // line circom 192
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 2; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void PedersenCommitmentBase3_25_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 25;
ctx->componentMemory[coffset].templateName = "PedersenCommitmentBase3";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 3;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[8]{0};
}

void PedersenCommitmentBase3_25_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[7];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "m2_bits";
Num2Bits_7_create(mySignalStart+4002,517+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 517+ctx_index+1;
}
{
std::string new_cmp_name = "m3_bits";
Num2Bits_8_create(mySignalStart+12036,1541+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 1541+ctx_index+1;
}
{
std::string new_cmp_name = "m4_bits";
Num2Bits_9_create(mySignalStart+13044,1641+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[2] = 1641+ctx_index+1;
}
{
std::string new_cmp_name = "m2H";
EscalarMulAny_19_create(mySignalStart+25,2+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[3] = 2+ctx_index+1;
}
{
std::string new_cmp_name = "m3D";
EscalarMulAny_22_create(mySignalStart+4131,518+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[4] = 518+ctx_index+1;
}
{
std::string new_cmp_name = "m4K";
EscalarMulAny_24_create(mySignalStart+12291,1542+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[5] = 1542+ctx_index+1;
}
{
std::string new_cmp_name = "add1";
BabyAdd_17_create(mySignalStart+5,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[6] = 0+ctx_index+1;
}
{
std::string new_cmp_name = "add2";
BabyAdd_17_create(mySignalStart+15,1+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[7] = 1+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 128];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_7_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 254];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 3]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_8_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 24];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 4]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_9_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[178]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[179]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[180]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[181]);
}
{
PFrElement aux_dest = &lvar[4];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[182]);
}
{
PFrElement aux_dest = &lvar[5];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[183]);
}
{
PFrElement aux_dest = &lvar[6];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[6],&circuitConstants[161]); // line circom 223
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[6])) + 2)];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ((1 * Fr_toInt(&lvar[6])) + 0)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
PFrElement aux_dest = &lvar[6];
// load src
Fr_add(&expaux[0],&lvar[6],&circuitConstants[1]); // line circom 223
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[6],&circuitConstants[161]); // line circom 223
}
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 130];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[178]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 131];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[179]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
EscalarMulAny_19_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[6];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[6],&circuitConstants[162]); // line circom 230
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[6])) + 2)];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + ((1 * Fr_toInt(&lvar[6])) + 0)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
PFrElement aux_dest = &lvar[6];
// load src
Fr_add(&expaux[0],&lvar[6],&circuitConstants[1]); // line circom 230
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[6],&circuitConstants[162]); // line circom 230
}
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 256];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[180]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 257];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[181]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
EscalarMulAny_22_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[6];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[6],&circuitConstants[63]); // line circom 237
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 5;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[6])) + 2)];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + ((1 * Fr_toInt(&lvar[6])) + 0)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
PFrElement aux_dest = &lvar[6];
// load src
Fr_add(&expaux[0],&lvar[6],&circuitConstants[1]); // line circom 237
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[6],&circuitConstants[63]); // line circom 237
}
{
uint cmp_index_ref = 5;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 26];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[182]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 5;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 27];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[183]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
EscalarMulAny_24_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[4]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[4]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 6;
cmp_index_ref_load = 6;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[6]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 6;
cmp_index_ref_load = 6;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[6]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 7;
cmp_index_ref_load = 7;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[7]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 7;
cmp_index_ref_load = 7;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[7]].signalStart + 1]);
}
for (uint i = 0; i < 8; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void PedersenCommitmentM1_26_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 26;
ctx->componentMemory[coffset].templateName = "PedersenCommitmentM1";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[2]{0};
}

void PedersenCommitmentM1_26_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[3];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "m1_bits";
Num2Bits_7_create(mySignalStart+3980,515+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 515+ctx_index+1;
}
{
std::string new_cmp_name = "m1G";
EscalarMulAny_19_create(mySignalStart+3,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 0+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 128];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_7_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[184]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[185]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[2],&circuitConstants[161]); // line circom 276
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[2])) + 2)];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ((1 * Fr_toInt(&lvar[2])) + 0)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&circuitConstants[1]); // line circom 276
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[2],&circuitConstants[161]); // line circom 276
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 130];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[184]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 131];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[185]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
EscalarMulAny_19_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 1]);
}
for (uint i = 0; i < 2; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void PedersenCommitmentR_27_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 27;
ctx->componentMemory[coffset].templateName = "PedersenCommitmentR";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[2]{0};
}

void PedersenCommitmentR_27_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[3];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "r_bits";
Num2Bits_8_create(mySignalStart+7908,1023+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 1023+ctx_index+1;
}
{
std::string new_cmp_name = "rJ";
EscalarMulAny_22_create(mySignalStart+3,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 0+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 254];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_8_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[186]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[187]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[2],&circuitConstants[162]); // line circom 304
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[2])) + 2)];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ((1 * Fr_toInt(&lvar[2])) + 0)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&circuitConstants[1]); // line circom 304
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[2],&circuitConstants[162]); // line circom 304
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 256];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[186]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 257];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[187]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
EscalarMulAny_22_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 1]);
}
for (uint i = 0; i < 2; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void IsEqual_28_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 28;
ctx->componentMemory[coffset].templateName = "IsEqual";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 2;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[1]{0};
}

void IsEqual_28_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[1];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "isz";
IsZero_10_create(mySignalStart+3,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 2],&signalValues[mySignalStart + 1]); // line circom 43
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]);
}
for (uint i = 0; i < 1; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Num2Bits_29_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 29;
ctx->componentMemory[coffset].templateName = "Num2Bits";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Num2Bits_29_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[152]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[152]); // line circom 31
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)];
// load src
Fr_shr(&expaux[1],&signalValues[mySignalStart + 64],&lvar[3]); // line circom 32
Fr_band(&expaux[0],&expaux[1],&circuitConstants[1]); // line circom 32
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_sub(&expaux[2],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&circuitConstants[1]); // line circom 33
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&expaux[2]); // line circom 33
{{
Fr_eq(&expaux[0],&expaux[1],&circuitConstants[0]); // line circom 33
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 33. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&lvar[2]); // line circom 34
Fr_add(&expaux[0],&lvar[1],&expaux[1]); // line circom 34
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&lvar[2]); // line circom 35
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
Fr_add(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 31
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[152]); // line circom 31
}
{
{{
Fr_eq(&expaux[0],&lvar[1],&signalValues[mySignalStart + 64]); // line circom 38
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 38. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Num2Bits_30_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 30;
ctx->componentMemory[coffset].templateName = "Num2Bits";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Num2Bits_30_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[81]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[81]); // line circom 31
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)];
// load src
Fr_shr(&expaux[1],&signalValues[mySignalStart + 33],&lvar[3]); // line circom 32
Fr_band(&expaux[0],&expaux[1],&circuitConstants[1]); // line circom 32
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_sub(&expaux[2],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&circuitConstants[1]); // line circom 33
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&expaux[2]); // line circom 33
{{
Fr_eq(&expaux[0],&expaux[1],&circuitConstants[0]); // line circom 33
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 33. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&lvar[2]); // line circom 34
Fr_add(&expaux[0],&lvar[1],&expaux[1]); // line circom 34
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&lvar[2]); // line circom 35
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
Fr_add(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 31
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[81]); // line circom 31
}
{
{{
Fr_eq(&expaux[0],&lvar[1],&signalValues[mySignalStart + 33]); // line circom 38
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 38. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void LessThan_31_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 31;
ctx->componentMemory[coffset].templateName = "LessThan";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 2;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[1]{0};
}

void LessThan_31_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[3];
FrElement lvar[1];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[79]);
}
{
std::string new_cmp_name = "n2b";
Num2Bits_30_create(mySignalStart+3,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
if (!Fr_isTrue(&circuitConstants[1])) std::cout << "Failed assert in template/function " << myTemplateName << " line 90. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&circuitConstants[1]));
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 33];
// load src
Fr_add(&expaux[1],&signalValues[mySignalStart + 1],&circuitConstants[188]); // line circom 96
Fr_sub(&expaux[0],&expaux[1],&signalValues[mySignalStart + 2]); // line circom 96
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_30_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 32]); // line circom 98
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 1; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void LeanIMTVerify_32_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 32;
ctx->componentMemory[coffset].templateName = "LeanIMTVerify";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 36;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[130]{0};
}

void LeanIMTVerify_32_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "n2b";
Num2Bits_29_create(mySignalStart+111013,10496+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 10496+ctx_index+1;
}
{
std::string new_cmp_name = "lt_0";
LessThan_31_create(mySignalStart+109829,10432+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 10432+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_0";
IsZero_10_create(mySignalStart+111084,10499+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[2] = 10499+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_0";
Poseidon2Hash2_6_create(mySignalStart+55109,5216+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[3] = 5216+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_0";
Poseidon2Hash2_6_create(mySignalStart+389,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[4] = 0+ctx_index+1;
}
{
std::string new_cmp_name = "lt_1";
LessThan_31_create(mySignalStart+109866,10434+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[5] = 10434+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_1";
IsZero_10_create(mySignalStart+111087,10500+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[6] = 10500+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_1";
Poseidon2Hash2_6_create(mySignalStart+56819,5379+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[7] = 5379+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_1";
Poseidon2Hash2_6_create(mySignalStart+2099,163+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[8] = 163+ctx_index+1;
}
{
std::string new_cmp_name = "lt_2";
LessThan_31_create(mySignalStart+110273,10456+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[9] = 10456+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_2";
IsZero_10_create(mySignalStart+111120,10511+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[10] = 10511+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_2";
Poseidon2Hash2_6_create(mySignalStart+75629,7172+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[11] = 7172+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_2";
Poseidon2Hash2_6_create(mySignalStart+20909,1956+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[12] = 1956+ctx_index+1;
}
{
std::string new_cmp_name = "lt_3";
LessThan_31_create(mySignalStart+110680,10478+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[13] = 10478+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_3";
IsZero_10_create(mySignalStart+111153,10522+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[14] = 10522+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_3";
Poseidon2Hash2_6_create(mySignalStart+94439,8965+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[15] = 8965+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_3";
Poseidon2Hash2_6_create(mySignalStart+39719,3749+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[16] = 3749+ctx_index+1;
}
{
std::string new_cmp_name = "lt_4";
LessThan_31_create(mySignalStart+110791,10484+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[17] = 10484+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_4";
IsZero_10_create(mySignalStart+111162,10525+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[18] = 10525+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_4";
Poseidon2Hash2_6_create(mySignalStart+99569,9454+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[19] = 9454+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_4";
Poseidon2Hash2_6_create(mySignalStart+44849,4238+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[20] = 4238+ctx_index+1;
}
{
std::string new_cmp_name = "lt_5";
LessThan_31_create(mySignalStart+110828,10486+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[21] = 10486+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_5";
IsZero_10_create(mySignalStart+111165,10526+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[22] = 10526+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_5";
Poseidon2Hash2_6_create(mySignalStart+101279,9617+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[23] = 9617+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_5";
Poseidon2Hash2_6_create(mySignalStart+46559,4401+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[24] = 4401+ctx_index+1;
}
{
std::string new_cmp_name = "lt_6";
LessThan_31_create(mySignalStart+110865,10488+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[25] = 10488+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_6";
IsZero_10_create(mySignalStart+111168,10527+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[26] = 10527+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_6";
Poseidon2Hash2_6_create(mySignalStart+102989,9780+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[27] = 9780+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_6";
Poseidon2Hash2_6_create(mySignalStart+48269,4564+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[28] = 4564+ctx_index+1;
}
{
std::string new_cmp_name = "lt_7";
LessThan_31_create(mySignalStart+110902,10490+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[29] = 10490+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_7";
IsZero_10_create(mySignalStart+111171,10528+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[30] = 10528+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_7";
Poseidon2Hash2_6_create(mySignalStart+104699,9943+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[31] = 9943+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_7";
Poseidon2Hash2_6_create(mySignalStart+49979,4727+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[32] = 4727+ctx_index+1;
}
{
std::string new_cmp_name = "lt_8";
LessThan_31_create(mySignalStart+110939,10492+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[33] = 10492+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_8";
IsZero_10_create(mySignalStart+111174,10529+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[34] = 10529+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_8";
Poseidon2Hash2_6_create(mySignalStart+106409,10106+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[35] = 10106+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_8";
Poseidon2Hash2_6_create(mySignalStart+51689,4890+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[36] = 4890+ctx_index+1;
}
{
std::string new_cmp_name = "lt_9";
LessThan_31_create(mySignalStart+110976,10494+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[37] = 10494+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_9";
IsZero_10_create(mySignalStart+111177,10530+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[38] = 10530+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_9";
Poseidon2Hash2_6_create(mySignalStart+108119,10269+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[39] = 10269+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_9";
Poseidon2Hash2_6_create(mySignalStart+53399,5053+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[40] = 5053+ctx_index+1;
}
{
std::string new_cmp_name = "lt_10";
LessThan_31_create(mySignalStart+109903,10436+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[41] = 10436+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_10";
IsZero_10_create(mySignalStart+111090,10501+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[42] = 10501+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_10";
Poseidon2Hash2_6_create(mySignalStart+58529,5542+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[43] = 5542+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_10";
Poseidon2Hash2_6_create(mySignalStart+3809,326+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[44] = 326+ctx_index+1;
}
{
std::string new_cmp_name = "lt_11";
LessThan_31_create(mySignalStart+109940,10438+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[45] = 10438+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_11";
IsZero_10_create(mySignalStart+111093,10502+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[46] = 10502+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_11";
Poseidon2Hash2_6_create(mySignalStart+60239,5705+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[47] = 5705+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_11";
Poseidon2Hash2_6_create(mySignalStart+5519,489+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[48] = 489+ctx_index+1;
}
{
std::string new_cmp_name = "lt_12";
LessThan_31_create(mySignalStart+109977,10440+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[49] = 10440+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_12";
IsZero_10_create(mySignalStart+111096,10503+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[50] = 10503+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_12";
Poseidon2Hash2_6_create(mySignalStart+61949,5868+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[51] = 5868+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_12";
Poseidon2Hash2_6_create(mySignalStart+7229,652+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[52] = 652+ctx_index+1;
}
{
std::string new_cmp_name = "lt_13";
LessThan_31_create(mySignalStart+110014,10442+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[53] = 10442+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_13";
IsZero_10_create(mySignalStart+111099,10504+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[54] = 10504+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_13";
Poseidon2Hash2_6_create(mySignalStart+63659,6031+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[55] = 6031+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_13";
Poseidon2Hash2_6_create(mySignalStart+8939,815+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[56] = 815+ctx_index+1;
}
{
std::string new_cmp_name = "lt_14";
LessThan_31_create(mySignalStart+110051,10444+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[57] = 10444+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_14";
IsZero_10_create(mySignalStart+111102,10505+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[58] = 10505+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_14";
Poseidon2Hash2_6_create(mySignalStart+65369,6194+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[59] = 6194+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_14";
Poseidon2Hash2_6_create(mySignalStart+10649,978+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[60] = 978+ctx_index+1;
}
{
std::string new_cmp_name = "lt_15";
LessThan_31_create(mySignalStart+110088,10446+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[61] = 10446+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_15";
IsZero_10_create(mySignalStart+111105,10506+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[62] = 10506+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_15";
Poseidon2Hash2_6_create(mySignalStart+67079,6357+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[63] = 6357+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_15";
Poseidon2Hash2_6_create(mySignalStart+12359,1141+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[64] = 1141+ctx_index+1;
}
{
std::string new_cmp_name = "lt_16";
LessThan_31_create(mySignalStart+110125,10448+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[65] = 10448+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_16";
IsZero_10_create(mySignalStart+111108,10507+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[66] = 10507+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_16";
Poseidon2Hash2_6_create(mySignalStart+68789,6520+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[67] = 6520+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_16";
Poseidon2Hash2_6_create(mySignalStart+14069,1304+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[68] = 1304+ctx_index+1;
}
{
std::string new_cmp_name = "lt_17";
LessThan_31_create(mySignalStart+110162,10450+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[69] = 10450+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_17";
IsZero_10_create(mySignalStart+111111,10508+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[70] = 10508+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_17";
Poseidon2Hash2_6_create(mySignalStart+70499,6683+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[71] = 6683+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_17";
Poseidon2Hash2_6_create(mySignalStart+15779,1467+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[72] = 1467+ctx_index+1;
}
{
std::string new_cmp_name = "lt_18";
LessThan_31_create(mySignalStart+110199,10452+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[73] = 10452+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_18";
IsZero_10_create(mySignalStart+111114,10509+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[74] = 10509+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_18";
Poseidon2Hash2_6_create(mySignalStart+72209,6846+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[75] = 6846+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_18";
Poseidon2Hash2_6_create(mySignalStart+17489,1630+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[76] = 1630+ctx_index+1;
}
{
std::string new_cmp_name = "lt_19";
LessThan_31_create(mySignalStart+110236,10454+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[77] = 10454+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_19";
IsZero_10_create(mySignalStart+111117,10510+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[78] = 10510+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_19";
Poseidon2Hash2_6_create(mySignalStart+73919,7009+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[79] = 7009+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_19";
Poseidon2Hash2_6_create(mySignalStart+19199,1793+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[80] = 1793+ctx_index+1;
}
{
std::string new_cmp_name = "lt_20";
LessThan_31_create(mySignalStart+110310,10458+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[81] = 10458+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_20";
IsZero_10_create(mySignalStart+111123,10512+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[82] = 10512+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_20";
Poseidon2Hash2_6_create(mySignalStart+77339,7335+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[83] = 7335+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_20";
Poseidon2Hash2_6_create(mySignalStart+22619,2119+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[84] = 2119+ctx_index+1;
}
{
std::string new_cmp_name = "lt_21";
LessThan_31_create(mySignalStart+110347,10460+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[85] = 10460+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_21";
IsZero_10_create(mySignalStart+111126,10513+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[86] = 10513+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_21";
Poseidon2Hash2_6_create(mySignalStart+79049,7498+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[87] = 7498+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_21";
Poseidon2Hash2_6_create(mySignalStart+24329,2282+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[88] = 2282+ctx_index+1;
}
{
std::string new_cmp_name = "lt_22";
LessThan_31_create(mySignalStart+110384,10462+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[89] = 10462+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_22";
IsZero_10_create(mySignalStart+111129,10514+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[90] = 10514+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_22";
Poseidon2Hash2_6_create(mySignalStart+80759,7661+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[91] = 7661+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_22";
Poseidon2Hash2_6_create(mySignalStart+26039,2445+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[92] = 2445+ctx_index+1;
}
{
std::string new_cmp_name = "lt_23";
LessThan_31_create(mySignalStart+110421,10464+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[93] = 10464+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_23";
IsZero_10_create(mySignalStart+111132,10515+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[94] = 10515+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_23";
Poseidon2Hash2_6_create(mySignalStart+82469,7824+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[95] = 7824+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_23";
Poseidon2Hash2_6_create(mySignalStart+27749,2608+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[96] = 2608+ctx_index+1;
}
{
std::string new_cmp_name = "lt_24";
LessThan_31_create(mySignalStart+110458,10466+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[97] = 10466+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_24";
IsZero_10_create(mySignalStart+111135,10516+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[98] = 10516+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_24";
Poseidon2Hash2_6_create(mySignalStart+84179,7987+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[99] = 7987+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_24";
Poseidon2Hash2_6_create(mySignalStart+29459,2771+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[100] = 2771+ctx_index+1;
}
{
std::string new_cmp_name = "lt_25";
LessThan_31_create(mySignalStart+110495,10468+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[101] = 10468+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_25";
IsZero_10_create(mySignalStart+111138,10517+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[102] = 10517+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_25";
Poseidon2Hash2_6_create(mySignalStart+85889,8150+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[103] = 8150+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_25";
Poseidon2Hash2_6_create(mySignalStart+31169,2934+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[104] = 2934+ctx_index+1;
}
{
std::string new_cmp_name = "lt_26";
LessThan_31_create(mySignalStart+110532,10470+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[105] = 10470+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_26";
IsZero_10_create(mySignalStart+111141,10518+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[106] = 10518+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_26";
Poseidon2Hash2_6_create(mySignalStart+87599,8313+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[107] = 8313+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_26";
Poseidon2Hash2_6_create(mySignalStart+32879,3097+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[108] = 3097+ctx_index+1;
}
{
std::string new_cmp_name = "lt_27";
LessThan_31_create(mySignalStart+110569,10472+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[109] = 10472+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_27";
IsZero_10_create(mySignalStart+111144,10519+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[110] = 10519+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_27";
Poseidon2Hash2_6_create(mySignalStart+89309,8476+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[111] = 8476+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_27";
Poseidon2Hash2_6_create(mySignalStart+34589,3260+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[112] = 3260+ctx_index+1;
}
{
std::string new_cmp_name = "lt_28";
LessThan_31_create(mySignalStart+110606,10474+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[113] = 10474+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_28";
IsZero_10_create(mySignalStart+111147,10520+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[114] = 10520+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_28";
Poseidon2Hash2_6_create(mySignalStart+91019,8639+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[115] = 8639+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_28";
Poseidon2Hash2_6_create(mySignalStart+36299,3423+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[116] = 3423+ctx_index+1;
}
{
std::string new_cmp_name = "lt_29";
LessThan_31_create(mySignalStart+110643,10476+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[117] = 10476+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_29";
IsZero_10_create(mySignalStart+111150,10521+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[118] = 10521+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_29";
Poseidon2Hash2_6_create(mySignalStart+92729,8802+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[119] = 8802+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_29";
Poseidon2Hash2_6_create(mySignalStart+38009,3586+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[120] = 3586+ctx_index+1;
}
{
std::string new_cmp_name = "lt_30";
LessThan_31_create(mySignalStart+110717,10480+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[121] = 10480+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_30";
IsZero_10_create(mySignalStart+111156,10523+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[122] = 10523+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_30";
Poseidon2Hash2_6_create(mySignalStart+96149,9128+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[123] = 9128+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_30";
Poseidon2Hash2_6_create(mySignalStart+41429,3912+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[124] = 3912+ctx_index+1;
}
{
std::string new_cmp_name = "lt_31";
LessThan_31_create(mySignalStart+110754,10482+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[125] = 10482+ctx_index+1;
}
{
std::string new_cmp_name = "sibling_zero_31";
IsZero_10_create(mySignalStart+111159,10524+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[126] = 10524+ctx_index+1;
}
{
std::string new_cmp_name = "hash_right_31";
Poseidon2Hash2_6_create(mySignalStart+97859,9291+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[127] = 9291+ctx_index+1;
}
{
std::string new_cmp_name = "hash_left_31";
Poseidon2Hash2_6_create(mySignalStart+43139,4075+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[128] = 4075+ctx_index+1;
}
{
std::string new_cmp_name = "root_eq";
IsEqual_28_create(mySignalStart+111078,10497+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[129] = 10497+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 64];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_29_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 36];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 0]);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 69];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 70];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 71];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 4]);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 71]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 72];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + 0]); // line circom 62
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 71]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 36]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 36]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 71]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 73];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 70]); // line circom 84
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 74];
// load src
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[4]].signalStart + 0],&signalValues[mySignalStart + 36]); // line circom 92
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 75];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 72],&signalValues[mySignalStart + 74]); // line circom 96
Fr_add(&expaux[0],&signalValues[mySignalStart + 36],&expaux[1]); // line circom 96
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 76];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + 0],&signalValues[mySignalStart + 75]); // line circom 100
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 77];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 70],&signalValues[mySignalStart + 76]); // line circom 103
Fr_add(&expaux[0],&signalValues[mySignalStart + 75],&expaux[1]); // line circom 103
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 78];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 77],&signalValues[mySignalStart + 36]); // line circom 108
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 37];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 69],&signalValues[mySignalStart + 78]); // line circom 110
Fr_add(&expaux[0],&signalValues[mySignalStart + 36],&expaux[1]); // line circom 110
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 5;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 5;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 79];
// load src
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 80];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 1]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 81];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 5]);
}
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 81]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 82];
// load src
cmp_index_ref_load = 6;
cmp_index_ref_load = 6;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[6]].signalStart + 0]); // line circom 134
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 81]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 37]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 8;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 37]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 8;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 81]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 83];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 80]); // line circom 156
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 84];
// load src
cmp_index_ref_load = 8;
cmp_index_ref_load = 8;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[8]].signalStart + 0],&signalValues[mySignalStart + 37]); // line circom 164
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 85];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 82],&signalValues[mySignalStart + 84]); // line circom 168
Fr_add(&expaux[0],&signalValues[mySignalStart + 37],&expaux[1]); // line circom 168
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 86];
// load src
cmp_index_ref_load = 7;
cmp_index_ref_load = 7;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[7]].signalStart + 0],&signalValues[mySignalStart + 85]); // line circom 172
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 87];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 80],&signalValues[mySignalStart + 86]); // line circom 175
Fr_add(&expaux[0],&signalValues[mySignalStart + 85],&expaux[1]); // line circom 175
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 88];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 87],&signalValues[mySignalStart + 37]); // line circom 180
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 38];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 79],&signalValues[mySignalStart + 88]); // line circom 182
Fr_add(&expaux[0],&signalValues[mySignalStart + 37],&expaux[1]); // line circom 182
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 9;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[2]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 9;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 89];
// load src
cmp_index_ref_load = 9;
cmp_index_ref_load = 9;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[9]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 90];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 2]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 91];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 6]);
}
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 91]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 92];
// load src
cmp_index_ref_load = 10;
cmp_index_ref_load = 10;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[10]].signalStart + 0]); // line circom 206
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 11;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 91]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 11;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 38]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 12;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 38]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 12;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 91]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 93];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 90]); // line circom 228
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 94];
// load src
cmp_index_ref_load = 12;
cmp_index_ref_load = 12;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[12]].signalStart + 0],&signalValues[mySignalStart + 38]); // line circom 236
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 95];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 92],&signalValues[mySignalStart + 94]); // line circom 240
Fr_add(&expaux[0],&signalValues[mySignalStart + 38],&expaux[1]); // line circom 240
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 96];
// load src
cmp_index_ref_load = 11;
cmp_index_ref_load = 11;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[11]].signalStart + 0],&signalValues[mySignalStart + 95]); // line circom 244
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 97];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 90],&signalValues[mySignalStart + 96]); // line circom 247
Fr_add(&expaux[0],&signalValues[mySignalStart + 95],&expaux[1]); // line circom 247
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 98];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 97],&signalValues[mySignalStart + 38]); // line circom 252
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 39];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 89],&signalValues[mySignalStart + 98]); // line circom 254
Fr_add(&expaux[0],&signalValues[mySignalStart + 38],&expaux[1]); // line circom 254
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 13;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[3]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 13;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 99];
// load src
cmp_index_ref_load = 13;
cmp_index_ref_load = 13;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[13]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 100];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 3]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 101];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 7]);
}
{
uint cmp_index_ref = 14;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 101]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 102];
// load src
cmp_index_ref_load = 14;
cmp_index_ref_load = 14;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[14]].signalStart + 0]); // line circom 278
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 15;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 101]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 15;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 39]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 16;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 39]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 16;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 101]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 103];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 100]); // line circom 300
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 104];
// load src
cmp_index_ref_load = 16;
cmp_index_ref_load = 16;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[16]].signalStart + 0],&signalValues[mySignalStart + 39]); // line circom 308
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 105];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 102],&signalValues[mySignalStart + 104]); // line circom 312
Fr_add(&expaux[0],&signalValues[mySignalStart + 39],&expaux[1]); // line circom 312
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 106];
// load src
cmp_index_ref_load = 15;
cmp_index_ref_load = 15;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[15]].signalStart + 0],&signalValues[mySignalStart + 105]); // line circom 316
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 107];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 100],&signalValues[mySignalStart + 106]); // line circom 319
Fr_add(&expaux[0],&signalValues[mySignalStart + 105],&expaux[1]); // line circom 319
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 108];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 107],&signalValues[mySignalStart + 39]); // line circom 324
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 40];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 99],&signalValues[mySignalStart + 108]); // line circom 326
Fr_add(&expaux[0],&signalValues[mySignalStart + 39],&expaux[1]); // line circom 326
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 17;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[4]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 17;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 109];
// load src
cmp_index_ref_load = 17;
cmp_index_ref_load = 17;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[17]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 110];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 4]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 111];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 8]);
}
{
uint cmp_index_ref = 18;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 111]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 112];
// load src
cmp_index_ref_load = 18;
cmp_index_ref_load = 18;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[18]].signalStart + 0]); // line circom 350
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 19;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 111]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 19;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 40]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 20;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 40]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 20;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 111]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 113];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 110]); // line circom 372
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 114];
// load src
cmp_index_ref_load = 20;
cmp_index_ref_load = 20;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[20]].signalStart + 0],&signalValues[mySignalStart + 40]); // line circom 380
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 115];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 112],&signalValues[mySignalStart + 114]); // line circom 384
Fr_add(&expaux[0],&signalValues[mySignalStart + 40],&expaux[1]); // line circom 384
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 116];
// load src
cmp_index_ref_load = 19;
cmp_index_ref_load = 19;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[19]].signalStart + 0],&signalValues[mySignalStart + 115]); // line circom 388
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 117];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 110],&signalValues[mySignalStart + 116]); // line circom 391
Fr_add(&expaux[0],&signalValues[mySignalStart + 115],&expaux[1]); // line circom 391
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 118];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 117],&signalValues[mySignalStart + 40]); // line circom 396
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 41];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 109],&signalValues[mySignalStart + 118]); // line circom 398
Fr_add(&expaux[0],&signalValues[mySignalStart + 40],&expaux[1]); // line circom 398
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 21;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[21]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 21;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 119];
// load src
cmp_index_ref_load = 21;
cmp_index_ref_load = 21;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[21]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 120];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 5]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 121];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 9]);
}
{
uint cmp_index_ref = 22;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 121]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 122];
// load src
cmp_index_ref_load = 22;
cmp_index_ref_load = 22;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[22]].signalStart + 0]); // line circom 422
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 23;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 121]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 23;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 41]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 24;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 41]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 24;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 121]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 123];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 120]); // line circom 444
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 124];
// load src
cmp_index_ref_load = 24;
cmp_index_ref_load = 24;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[24]].signalStart + 0],&signalValues[mySignalStart + 41]); // line circom 452
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 125];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 122],&signalValues[mySignalStart + 124]); // line circom 456
Fr_add(&expaux[0],&signalValues[mySignalStart + 41],&expaux[1]); // line circom 456
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 126];
// load src
cmp_index_ref_load = 23;
cmp_index_ref_load = 23;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[23]].signalStart + 0],&signalValues[mySignalStart + 125]); // line circom 460
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 127];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 120],&signalValues[mySignalStart + 126]); // line circom 463
Fr_add(&expaux[0],&signalValues[mySignalStart + 125],&expaux[1]); // line circom 463
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 128];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 127],&signalValues[mySignalStart + 41]); // line circom 468
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 42];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 119],&signalValues[mySignalStart + 128]); // line circom 470
Fr_add(&expaux[0],&signalValues[mySignalStart + 41],&expaux[1]); // line circom 470
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 25;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[27]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 25;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 129];
// load src
cmp_index_ref_load = 25;
cmp_index_ref_load = 25;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[25]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 130];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 6]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 131];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 10]);
}
{
uint cmp_index_ref = 26;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 131]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 132];
// load src
cmp_index_ref_load = 26;
cmp_index_ref_load = 26;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[26]].signalStart + 0]); // line circom 494
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 27;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 131]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 27;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 42]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 28;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 42]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 28;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 131]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 133];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 130]); // line circom 516
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 134];
// load src
cmp_index_ref_load = 28;
cmp_index_ref_load = 28;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[28]].signalStart + 0],&signalValues[mySignalStart + 42]); // line circom 524
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 135];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 132],&signalValues[mySignalStart + 134]); // line circom 528
Fr_add(&expaux[0],&signalValues[mySignalStart + 42],&expaux[1]); // line circom 528
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 136];
// load src
cmp_index_ref_load = 27;
cmp_index_ref_load = 27;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[27]].signalStart + 0],&signalValues[mySignalStart + 135]); // line circom 532
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 137];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 130],&signalValues[mySignalStart + 136]); // line circom 535
Fr_add(&expaux[0],&signalValues[mySignalStart + 135],&expaux[1]); // line circom 535
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 138];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 137],&signalValues[mySignalStart + 42]); // line circom 540
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 43];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 129],&signalValues[mySignalStart + 138]); // line circom 542
Fr_add(&expaux[0],&signalValues[mySignalStart + 42],&expaux[1]); // line circom 542
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 29;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[29]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 29;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 139];
// load src
cmp_index_ref_load = 29;
cmp_index_ref_load = 29;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[29]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 140];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 7]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 141];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 11]);
}
{
uint cmp_index_ref = 30;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 141]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 142];
// load src
cmp_index_ref_load = 30;
cmp_index_ref_load = 30;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[30]].signalStart + 0]); // line circom 566
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 31;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 141]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 31;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 43]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 32;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 43]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 32;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 141]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 143];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 140]); // line circom 588
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 144];
// load src
cmp_index_ref_load = 32;
cmp_index_ref_load = 32;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[32]].signalStart + 0],&signalValues[mySignalStart + 43]); // line circom 596
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 145];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 142],&signalValues[mySignalStart + 144]); // line circom 600
Fr_add(&expaux[0],&signalValues[mySignalStart + 43],&expaux[1]); // line circom 600
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 146];
// load src
cmp_index_ref_load = 31;
cmp_index_ref_load = 31;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[31]].signalStart + 0],&signalValues[mySignalStart + 145]); // line circom 604
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 147];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 140],&signalValues[mySignalStart + 146]); // line circom 607
Fr_add(&expaux[0],&signalValues[mySignalStart + 145],&expaux[1]); // line circom 607
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 148];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 147],&signalValues[mySignalStart + 43]); // line circom 612
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 44];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 139],&signalValues[mySignalStart + 148]); // line circom 614
Fr_add(&expaux[0],&signalValues[mySignalStart + 43],&expaux[1]); // line circom 614
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 33;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[31]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 33;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 149];
// load src
cmp_index_ref_load = 33;
cmp_index_ref_load = 33;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[33]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 150];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 8]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 151];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 12]);
}
{
uint cmp_index_ref = 34;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 151]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 152];
// load src
cmp_index_ref_load = 34;
cmp_index_ref_load = 34;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[34]].signalStart + 0]); // line circom 638
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 35;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 151]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 35;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 44]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 36;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 44]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 36;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 151]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 153];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 150]); // line circom 660
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 154];
// load src
cmp_index_ref_load = 36;
cmp_index_ref_load = 36;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[36]].signalStart + 0],&signalValues[mySignalStart + 44]); // line circom 668
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 155];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 152],&signalValues[mySignalStart + 154]); // line circom 672
Fr_add(&expaux[0],&signalValues[mySignalStart + 44],&expaux[1]); // line circom 672
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 156];
// load src
cmp_index_ref_load = 35;
cmp_index_ref_load = 35;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[35]].signalStart + 0],&signalValues[mySignalStart + 155]); // line circom 676
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 157];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 150],&signalValues[mySignalStart + 156]); // line circom 679
Fr_add(&expaux[0],&signalValues[mySignalStart + 155],&expaux[1]); // line circom 679
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 158];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 157],&signalValues[mySignalStart + 44]); // line circom 684
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 45];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 149],&signalValues[mySignalStart + 158]); // line circom 686
Fr_add(&expaux[0],&signalValues[mySignalStart + 44],&expaux[1]); // line circom 686
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 37;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[33]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 37;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 159];
// load src
cmp_index_ref_load = 37;
cmp_index_ref_load = 37;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[37]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 160];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 9]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 161];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 13]);
}
{
uint cmp_index_ref = 38;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 161]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 162];
// load src
cmp_index_ref_load = 38;
cmp_index_ref_load = 38;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[38]].signalStart + 0]); // line circom 710
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 39;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 161]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 39;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 45]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 40;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 45]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 40;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 161]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 163];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 160]); // line circom 732
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 164];
// load src
cmp_index_ref_load = 40;
cmp_index_ref_load = 40;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[40]].signalStart + 0],&signalValues[mySignalStart + 45]); // line circom 740
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 165];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 162],&signalValues[mySignalStart + 164]); // line circom 744
Fr_add(&expaux[0],&signalValues[mySignalStart + 45],&expaux[1]); // line circom 744
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 166];
// load src
cmp_index_ref_load = 39;
cmp_index_ref_load = 39;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[39]].signalStart + 0],&signalValues[mySignalStart + 165]); // line circom 748
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 167];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 160],&signalValues[mySignalStart + 166]); // line circom 751
Fr_add(&expaux[0],&signalValues[mySignalStart + 165],&expaux[1]); // line circom 751
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 168];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 167],&signalValues[mySignalStart + 45]); // line circom 756
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 46];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 159],&signalValues[mySignalStart + 168]); // line circom 758
Fr_add(&expaux[0],&signalValues[mySignalStart + 45],&expaux[1]); // line circom 758
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 41;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[35]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 41;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 169];
// load src
cmp_index_ref_load = 41;
cmp_index_ref_load = 41;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[41]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 170];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 10]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 171];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 14]);
}
{
uint cmp_index_ref = 42;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 171]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 172];
// load src
cmp_index_ref_load = 42;
cmp_index_ref_load = 42;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[42]].signalStart + 0]); // line circom 782
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 43;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 171]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 43;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 46]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 44;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 46]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 44;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 171]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 173];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 170]); // line circom 804
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 174];
// load src
cmp_index_ref_load = 44;
cmp_index_ref_load = 44;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[44]].signalStart + 0],&signalValues[mySignalStart + 46]); // line circom 812
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 175];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 172],&signalValues[mySignalStart + 174]); // line circom 816
Fr_add(&expaux[0],&signalValues[mySignalStart + 46],&expaux[1]); // line circom 816
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 176];
// load src
cmp_index_ref_load = 43;
cmp_index_ref_load = 43;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[43]].signalStart + 0],&signalValues[mySignalStart + 175]); // line circom 820
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 177];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 170],&signalValues[mySignalStart + 176]); // line circom 823
Fr_add(&expaux[0],&signalValues[mySignalStart + 175],&expaux[1]); // line circom 823
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 178];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 177],&signalValues[mySignalStart + 46]); // line circom 828
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 47];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 169],&signalValues[mySignalStart + 178]); // line circom 830
Fr_add(&expaux[0],&signalValues[mySignalStart + 46],&expaux[1]); // line circom 830
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 45;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[37]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 45;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 179];
// load src
cmp_index_ref_load = 45;
cmp_index_ref_load = 45;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[45]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 180];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 11]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 181];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 15]);
}
{
uint cmp_index_ref = 46;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 181]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 182];
// load src
cmp_index_ref_load = 46;
cmp_index_ref_load = 46;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[46]].signalStart + 0]); // line circom 854
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 47;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 181]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 47;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 47]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 48;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 47]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 48;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 181]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 183];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 180]); // line circom 876
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 184];
// load src
cmp_index_ref_load = 48;
cmp_index_ref_load = 48;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[48]].signalStart + 0],&signalValues[mySignalStart + 47]); // line circom 884
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 185];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 182],&signalValues[mySignalStart + 184]); // line circom 888
Fr_add(&expaux[0],&signalValues[mySignalStart + 47],&expaux[1]); // line circom 888
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 186];
// load src
cmp_index_ref_load = 47;
cmp_index_ref_load = 47;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[47]].signalStart + 0],&signalValues[mySignalStart + 185]); // line circom 892
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 187];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 180],&signalValues[mySignalStart + 186]); // line circom 895
Fr_add(&expaux[0],&signalValues[mySignalStart + 185],&expaux[1]); // line circom 895
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 188];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 187],&signalValues[mySignalStart + 47]); // line circom 900
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 48];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 179],&signalValues[mySignalStart + 188]); // line circom 902
Fr_add(&expaux[0],&signalValues[mySignalStart + 47],&expaux[1]); // line circom 902
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 49;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[39]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 49;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 189];
// load src
cmp_index_ref_load = 49;
cmp_index_ref_load = 49;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[49]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 190];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 12]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 191];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 16]);
}
{
uint cmp_index_ref = 50;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 191]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 192];
// load src
cmp_index_ref_load = 50;
cmp_index_ref_load = 50;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[50]].signalStart + 0]); // line circom 926
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 51;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 191]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 51;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 48]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 52;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 48]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 52;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 191]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 193];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 190]); // line circom 948
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 194];
// load src
cmp_index_ref_load = 52;
cmp_index_ref_load = 52;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[52]].signalStart + 0],&signalValues[mySignalStart + 48]); // line circom 956
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 195];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 192],&signalValues[mySignalStart + 194]); // line circom 960
Fr_add(&expaux[0],&signalValues[mySignalStart + 48],&expaux[1]); // line circom 960
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 196];
// load src
cmp_index_ref_load = 51;
cmp_index_ref_load = 51;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[51]].signalStart + 0],&signalValues[mySignalStart + 195]); // line circom 964
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 197];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 190],&signalValues[mySignalStart + 196]); // line circom 967
Fr_add(&expaux[0],&signalValues[mySignalStart + 195],&expaux[1]); // line circom 967
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 198];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 197],&signalValues[mySignalStart + 48]); // line circom 972
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 49];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 189],&signalValues[mySignalStart + 198]); // line circom 974
Fr_add(&expaux[0],&signalValues[mySignalStart + 48],&expaux[1]); // line circom 974
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 53;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[41]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 53;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 199];
// load src
cmp_index_ref_load = 53;
cmp_index_ref_load = 53;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[53]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 200];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 13]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 201];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 17]);
}
{
uint cmp_index_ref = 54;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 201]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 202];
// load src
cmp_index_ref_load = 54;
cmp_index_ref_load = 54;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[54]].signalStart + 0]); // line circom 998
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 55;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 201]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 55;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 49]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 56;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 49]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 56;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 201]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 203];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 200]); // line circom 1020
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 204];
// load src
cmp_index_ref_load = 56;
cmp_index_ref_load = 56;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[56]].signalStart + 0],&signalValues[mySignalStart + 49]); // line circom 1028
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 205];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 202],&signalValues[mySignalStart + 204]); // line circom 1032
Fr_add(&expaux[0],&signalValues[mySignalStart + 49],&expaux[1]); // line circom 1032
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 206];
// load src
cmp_index_ref_load = 55;
cmp_index_ref_load = 55;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[55]].signalStart + 0],&signalValues[mySignalStart + 205]); // line circom 1036
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 207];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 200],&signalValues[mySignalStart + 206]); // line circom 1039
Fr_add(&expaux[0],&signalValues[mySignalStart + 205],&expaux[1]); // line circom 1039
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 208];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 207],&signalValues[mySignalStart + 49]); // line circom 1044
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 50];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 199],&signalValues[mySignalStart + 208]); // line circom 1046
Fr_add(&expaux[0],&signalValues[mySignalStart + 49],&expaux[1]); // line circom 1046
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 57;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[43]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 57;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 209];
// load src
cmp_index_ref_load = 57;
cmp_index_ref_load = 57;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[57]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 210];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 14]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 211];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 18]);
}
{
uint cmp_index_ref = 58;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 211]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 212];
// load src
cmp_index_ref_load = 58;
cmp_index_ref_load = 58;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[58]].signalStart + 0]); // line circom 1070
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 59;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 211]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 59;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 50]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 60;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 50]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 60;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 211]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 213];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 210]); // line circom 1092
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 214];
// load src
cmp_index_ref_load = 60;
cmp_index_ref_load = 60;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[60]].signalStart + 0],&signalValues[mySignalStart + 50]); // line circom 1100
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 215];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 212],&signalValues[mySignalStart + 214]); // line circom 1104
Fr_add(&expaux[0],&signalValues[mySignalStart + 50],&expaux[1]); // line circom 1104
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 216];
// load src
cmp_index_ref_load = 59;
cmp_index_ref_load = 59;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[59]].signalStart + 0],&signalValues[mySignalStart + 215]); // line circom 1108
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 217];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 210],&signalValues[mySignalStart + 216]); // line circom 1111
Fr_add(&expaux[0],&signalValues[mySignalStart + 215],&expaux[1]); // line circom 1111
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 218];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 217],&signalValues[mySignalStart + 50]); // line circom 1116
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 51];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 209],&signalValues[mySignalStart + 218]); // line circom 1118
Fr_add(&expaux[0],&signalValues[mySignalStart + 50],&expaux[1]); // line circom 1118
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 61;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[45]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 61;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 219];
// load src
cmp_index_ref_load = 61;
cmp_index_ref_load = 61;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[61]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 220];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 15]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 221];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 19]);
}
{
uint cmp_index_ref = 62;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 221]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 222];
// load src
cmp_index_ref_load = 62;
cmp_index_ref_load = 62;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[62]].signalStart + 0]); // line circom 1142
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 63;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 221]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 63;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 51]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 64;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 51]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 64;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 221]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 223];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 220]); // line circom 1164
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 224];
// load src
cmp_index_ref_load = 64;
cmp_index_ref_load = 64;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[64]].signalStart + 0],&signalValues[mySignalStart + 51]); // line circom 1172
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 225];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 222],&signalValues[mySignalStart + 224]); // line circom 1176
Fr_add(&expaux[0],&signalValues[mySignalStart + 51],&expaux[1]); // line circom 1176
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 226];
// load src
cmp_index_ref_load = 63;
cmp_index_ref_load = 63;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[63]].signalStart + 0],&signalValues[mySignalStart + 225]); // line circom 1180
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 227];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 220],&signalValues[mySignalStart + 226]); // line circom 1183
Fr_add(&expaux[0],&signalValues[mySignalStart + 225],&expaux[1]); // line circom 1183
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 228];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 227],&signalValues[mySignalStart + 51]); // line circom 1188
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 52];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 219],&signalValues[mySignalStart + 228]); // line circom 1190
Fr_add(&expaux[0],&signalValues[mySignalStart + 51],&expaux[1]); // line circom 1190
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 65;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[47]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 65;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 229];
// load src
cmp_index_ref_load = 65;
cmp_index_ref_load = 65;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[65]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 230];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 16]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 231];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 20]);
}
{
uint cmp_index_ref = 66;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 231]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 232];
// load src
cmp_index_ref_load = 66;
cmp_index_ref_load = 66;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[66]].signalStart + 0]); // line circom 1214
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 67;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 231]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 67;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 52]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 68;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 52]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 68;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 231]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 233];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 230]); // line circom 1236
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 234];
// load src
cmp_index_ref_load = 68;
cmp_index_ref_load = 68;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[68]].signalStart + 0],&signalValues[mySignalStart + 52]); // line circom 1244
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 235];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 232],&signalValues[mySignalStart + 234]); // line circom 1248
Fr_add(&expaux[0],&signalValues[mySignalStart + 52],&expaux[1]); // line circom 1248
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 236];
// load src
cmp_index_ref_load = 67;
cmp_index_ref_load = 67;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[67]].signalStart + 0],&signalValues[mySignalStart + 235]); // line circom 1252
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 237];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 230],&signalValues[mySignalStart + 236]); // line circom 1255
Fr_add(&expaux[0],&signalValues[mySignalStart + 235],&expaux[1]); // line circom 1255
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 238];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 237],&signalValues[mySignalStart + 52]); // line circom 1260
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 53];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 229],&signalValues[mySignalStart + 238]); // line circom 1262
Fr_add(&expaux[0],&signalValues[mySignalStart + 52],&expaux[1]); // line circom 1262
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 69;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[49]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 69;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 239];
// load src
cmp_index_ref_load = 69;
cmp_index_ref_load = 69;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[69]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 240];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 17]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 241];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 21]);
}
{
uint cmp_index_ref = 70;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 241]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 242];
// load src
cmp_index_ref_load = 70;
cmp_index_ref_load = 70;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[70]].signalStart + 0]); // line circom 1286
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 71;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 241]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 71;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 53]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 72;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 53]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 72;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 241]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 243];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 240]); // line circom 1308
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 244];
// load src
cmp_index_ref_load = 72;
cmp_index_ref_load = 72;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[72]].signalStart + 0],&signalValues[mySignalStart + 53]); // line circom 1316
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 245];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 242],&signalValues[mySignalStart + 244]); // line circom 1320
Fr_add(&expaux[0],&signalValues[mySignalStart + 53],&expaux[1]); // line circom 1320
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 246];
// load src
cmp_index_ref_load = 71;
cmp_index_ref_load = 71;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[71]].signalStart + 0],&signalValues[mySignalStart + 245]); // line circom 1324
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 247];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 240],&signalValues[mySignalStart + 246]); // line circom 1327
Fr_add(&expaux[0],&signalValues[mySignalStart + 245],&expaux[1]); // line circom 1327
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 248];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 247],&signalValues[mySignalStart + 53]); // line circom 1332
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 54];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 239],&signalValues[mySignalStart + 248]); // line circom 1334
Fr_add(&expaux[0],&signalValues[mySignalStart + 53],&expaux[1]); // line circom 1334
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 73;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[51]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 73;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 249];
// load src
cmp_index_ref_load = 73;
cmp_index_ref_load = 73;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[73]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 250];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 18]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 251];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 22]);
}
{
uint cmp_index_ref = 74;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 251]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 252];
// load src
cmp_index_ref_load = 74;
cmp_index_ref_load = 74;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[74]].signalStart + 0]); // line circom 1358
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 75;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 251]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 75;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 54]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 76;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 54]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 76;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 251]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 253];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 250]); // line circom 1380
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 254];
// load src
cmp_index_ref_load = 76;
cmp_index_ref_load = 76;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[76]].signalStart + 0],&signalValues[mySignalStart + 54]); // line circom 1388
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 255];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 252],&signalValues[mySignalStart + 254]); // line circom 1392
Fr_add(&expaux[0],&signalValues[mySignalStart + 54],&expaux[1]); // line circom 1392
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 256];
// load src
cmp_index_ref_load = 75;
cmp_index_ref_load = 75;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[75]].signalStart + 0],&signalValues[mySignalStart + 255]); // line circom 1396
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 257];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 250],&signalValues[mySignalStart + 256]); // line circom 1399
Fr_add(&expaux[0],&signalValues[mySignalStart + 255],&expaux[1]); // line circom 1399
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 258];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 257],&signalValues[mySignalStart + 54]); // line circom 1404
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 55];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 249],&signalValues[mySignalStart + 258]); // line circom 1406
Fr_add(&expaux[0],&signalValues[mySignalStart + 54],&expaux[1]); // line circom 1406
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 77;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[53]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 77;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 259];
// load src
cmp_index_ref_load = 77;
cmp_index_ref_load = 77;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[77]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 260];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 19]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 261];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 23]);
}
{
uint cmp_index_ref = 78;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 261]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 262];
// load src
cmp_index_ref_load = 78;
cmp_index_ref_load = 78;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[78]].signalStart + 0]); // line circom 1430
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 79;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 261]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 79;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 55]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 80;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 55]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 80;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 261]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 263];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 260]); // line circom 1452
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 264];
// load src
cmp_index_ref_load = 80;
cmp_index_ref_load = 80;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[80]].signalStart + 0],&signalValues[mySignalStart + 55]); // line circom 1460
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 265];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 262],&signalValues[mySignalStart + 264]); // line circom 1464
Fr_add(&expaux[0],&signalValues[mySignalStart + 55],&expaux[1]); // line circom 1464
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 266];
// load src
cmp_index_ref_load = 79;
cmp_index_ref_load = 79;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[79]].signalStart + 0],&signalValues[mySignalStart + 265]); // line circom 1468
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 267];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 260],&signalValues[mySignalStart + 266]); // line circom 1471
Fr_add(&expaux[0],&signalValues[mySignalStart + 265],&expaux[1]); // line circom 1471
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 268];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 267],&signalValues[mySignalStart + 55]); // line circom 1476
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 56];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 259],&signalValues[mySignalStart + 268]); // line circom 1478
Fr_add(&expaux[0],&signalValues[mySignalStart + 55],&expaux[1]); // line circom 1478
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 81;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[55]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 81;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 269];
// load src
cmp_index_ref_load = 81;
cmp_index_ref_load = 81;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[81]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 270];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 20]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 271];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 24]);
}
{
uint cmp_index_ref = 82;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 271]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 272];
// load src
cmp_index_ref_load = 82;
cmp_index_ref_load = 82;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[82]].signalStart + 0]); // line circom 1502
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 83;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 271]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 83;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 56]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 84;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 56]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 84;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 271]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 273];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 270]); // line circom 1524
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 274];
// load src
cmp_index_ref_load = 84;
cmp_index_ref_load = 84;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[84]].signalStart + 0],&signalValues[mySignalStart + 56]); // line circom 1532
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 275];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 272],&signalValues[mySignalStart + 274]); // line circom 1536
Fr_add(&expaux[0],&signalValues[mySignalStart + 56],&expaux[1]); // line circom 1536
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 276];
// load src
cmp_index_ref_load = 83;
cmp_index_ref_load = 83;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[83]].signalStart + 0],&signalValues[mySignalStart + 275]); // line circom 1540
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 277];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 270],&signalValues[mySignalStart + 276]); // line circom 1543
Fr_add(&expaux[0],&signalValues[mySignalStart + 275],&expaux[1]); // line circom 1543
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 278];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 277],&signalValues[mySignalStart + 56]); // line circom 1548
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 57];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 269],&signalValues[mySignalStart + 278]); // line circom 1550
Fr_add(&expaux[0],&signalValues[mySignalStart + 56],&expaux[1]); // line circom 1550
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 85;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[57]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 85;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 279];
// load src
cmp_index_ref_load = 85;
cmp_index_ref_load = 85;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[85]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 280];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 21]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 281];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 25]);
}
{
uint cmp_index_ref = 86;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 281]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 282];
// load src
cmp_index_ref_load = 86;
cmp_index_ref_load = 86;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[86]].signalStart + 0]); // line circom 1574
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 87;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 281]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 87;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 57]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 88;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 57]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 88;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 281]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 283];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 280]); // line circom 1596
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 284];
// load src
cmp_index_ref_load = 88;
cmp_index_ref_load = 88;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[88]].signalStart + 0],&signalValues[mySignalStart + 57]); // line circom 1604
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 285];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 282],&signalValues[mySignalStart + 284]); // line circom 1608
Fr_add(&expaux[0],&signalValues[mySignalStart + 57],&expaux[1]); // line circom 1608
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 286];
// load src
cmp_index_ref_load = 87;
cmp_index_ref_load = 87;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[87]].signalStart + 0],&signalValues[mySignalStart + 285]); // line circom 1612
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 287];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 280],&signalValues[mySignalStart + 286]); // line circom 1615
Fr_add(&expaux[0],&signalValues[mySignalStart + 285],&expaux[1]); // line circom 1615
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 288];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 287],&signalValues[mySignalStart + 57]); // line circom 1620
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 58];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 279],&signalValues[mySignalStart + 288]); // line circom 1622
Fr_add(&expaux[0],&signalValues[mySignalStart + 57],&expaux[1]); // line circom 1622
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 89;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[59]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 89;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 289];
// load src
cmp_index_ref_load = 89;
cmp_index_ref_load = 89;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[89]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 290];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 22]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 291];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 26]);
}
{
uint cmp_index_ref = 90;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 291]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 292];
// load src
cmp_index_ref_load = 90;
cmp_index_ref_load = 90;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[90]].signalStart + 0]); // line circom 1646
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 91;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 291]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 91;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 58]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 92;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 58]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 92;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 291]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 293];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 290]); // line circom 1668
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 294];
// load src
cmp_index_ref_load = 92;
cmp_index_ref_load = 92;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[92]].signalStart + 0],&signalValues[mySignalStart + 58]); // line circom 1676
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 295];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 292],&signalValues[mySignalStart + 294]); // line circom 1680
Fr_add(&expaux[0],&signalValues[mySignalStart + 58],&expaux[1]); // line circom 1680
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 296];
// load src
cmp_index_ref_load = 91;
cmp_index_ref_load = 91;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[91]].signalStart + 0],&signalValues[mySignalStart + 295]); // line circom 1684
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 297];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 290],&signalValues[mySignalStart + 296]); // line circom 1687
Fr_add(&expaux[0],&signalValues[mySignalStart + 295],&expaux[1]); // line circom 1687
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 298];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 297],&signalValues[mySignalStart + 58]); // line circom 1692
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 59];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 289],&signalValues[mySignalStart + 298]); // line circom 1694
Fr_add(&expaux[0],&signalValues[mySignalStart + 58],&expaux[1]); // line circom 1694
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 93;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[61]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 93;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 299];
// load src
cmp_index_ref_load = 93;
cmp_index_ref_load = 93;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[93]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 300];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 23]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 301];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 27]);
}
{
uint cmp_index_ref = 94;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 301]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 302];
// load src
cmp_index_ref_load = 94;
cmp_index_ref_load = 94;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[94]].signalStart + 0]); // line circom 1718
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 95;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 301]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 95;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 59]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 96;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 59]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 96;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 301]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 303];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 300]); // line circom 1740
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 304];
// load src
cmp_index_ref_load = 96;
cmp_index_ref_load = 96;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[96]].signalStart + 0],&signalValues[mySignalStart + 59]); // line circom 1748
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 305];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 302],&signalValues[mySignalStart + 304]); // line circom 1752
Fr_add(&expaux[0],&signalValues[mySignalStart + 59],&expaux[1]); // line circom 1752
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 306];
// load src
cmp_index_ref_load = 95;
cmp_index_ref_load = 95;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[95]].signalStart + 0],&signalValues[mySignalStart + 305]); // line circom 1756
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 307];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 300],&signalValues[mySignalStart + 306]); // line circom 1759
Fr_add(&expaux[0],&signalValues[mySignalStart + 305],&expaux[1]); // line circom 1759
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 308];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 307],&signalValues[mySignalStart + 59]); // line circom 1764
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 60];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 299],&signalValues[mySignalStart + 308]); // line circom 1766
Fr_add(&expaux[0],&signalValues[mySignalStart + 59],&expaux[1]); // line circom 1766
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 97;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[63]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 97;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 309];
// load src
cmp_index_ref_load = 97;
cmp_index_ref_load = 97;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[97]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 310];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 24]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 311];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 28]);
}
{
uint cmp_index_ref = 98;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 311]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 312];
// load src
cmp_index_ref_load = 98;
cmp_index_ref_load = 98;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[98]].signalStart + 0]); // line circom 1790
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 99;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 311]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 99;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 60]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 100;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 60]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 100;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 311]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 313];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 310]); // line circom 1812
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 314];
// load src
cmp_index_ref_load = 100;
cmp_index_ref_load = 100;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[100]].signalStart + 0],&signalValues[mySignalStart + 60]); // line circom 1820
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 315];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 312],&signalValues[mySignalStart + 314]); // line circom 1824
Fr_add(&expaux[0],&signalValues[mySignalStart + 60],&expaux[1]); // line circom 1824
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 316];
// load src
cmp_index_ref_load = 99;
cmp_index_ref_load = 99;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[99]].signalStart + 0],&signalValues[mySignalStart + 315]); // line circom 1828
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 317];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 310],&signalValues[mySignalStart + 316]); // line circom 1831
Fr_add(&expaux[0],&signalValues[mySignalStart + 315],&expaux[1]); // line circom 1831
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 318];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 317],&signalValues[mySignalStart + 60]); // line circom 1836
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 61];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 309],&signalValues[mySignalStart + 318]); // line circom 1838
Fr_add(&expaux[0],&signalValues[mySignalStart + 60],&expaux[1]); // line circom 1838
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 101;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[65]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 101;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 319];
// load src
cmp_index_ref_load = 101;
cmp_index_ref_load = 101;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[101]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 320];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 25]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 321];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 29]);
}
{
uint cmp_index_ref = 102;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 321]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 322];
// load src
cmp_index_ref_load = 102;
cmp_index_ref_load = 102;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[102]].signalStart + 0]); // line circom 1862
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 103;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 321]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 103;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 61]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 104;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 61]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 104;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 321]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 323];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 320]); // line circom 1884
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 324];
// load src
cmp_index_ref_load = 104;
cmp_index_ref_load = 104;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[104]].signalStart + 0],&signalValues[mySignalStart + 61]); // line circom 1892
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 325];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 322],&signalValues[mySignalStart + 324]); // line circom 1896
Fr_add(&expaux[0],&signalValues[mySignalStart + 61],&expaux[1]); // line circom 1896
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 326];
// load src
cmp_index_ref_load = 103;
cmp_index_ref_load = 103;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[103]].signalStart + 0],&signalValues[mySignalStart + 325]); // line circom 1900
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 327];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 320],&signalValues[mySignalStart + 326]); // line circom 1903
Fr_add(&expaux[0],&signalValues[mySignalStart + 325],&expaux[1]); // line circom 1903
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 328];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 327],&signalValues[mySignalStart + 61]); // line circom 1908
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 62];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 319],&signalValues[mySignalStart + 328]); // line circom 1910
Fr_add(&expaux[0],&signalValues[mySignalStart + 61],&expaux[1]); // line circom 1910
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 105;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[67]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 105;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 329];
// load src
cmp_index_ref_load = 105;
cmp_index_ref_load = 105;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[105]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 330];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 26]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 331];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 30]);
}
{
uint cmp_index_ref = 106;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 331]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 332];
// load src
cmp_index_ref_load = 106;
cmp_index_ref_load = 106;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[106]].signalStart + 0]); // line circom 1934
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 107;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 331]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 107;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 62]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 62]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 108;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 331]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 333];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 330]); // line circom 1956
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 334];
// load src
cmp_index_ref_load = 108;
cmp_index_ref_load = 108;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[108]].signalStart + 0],&signalValues[mySignalStart + 62]); // line circom 1964
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 335];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 332],&signalValues[mySignalStart + 334]); // line circom 1968
Fr_add(&expaux[0],&signalValues[mySignalStart + 62],&expaux[1]); // line circom 1968
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 336];
// load src
cmp_index_ref_load = 107;
cmp_index_ref_load = 107;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[107]].signalStart + 0],&signalValues[mySignalStart + 335]); // line circom 1972
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 337];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 330],&signalValues[mySignalStart + 336]); // line circom 1975
Fr_add(&expaux[0],&signalValues[mySignalStart + 335],&expaux[1]); // line circom 1975
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 338];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 337],&signalValues[mySignalStart + 62]); // line circom 1980
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 63];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 329],&signalValues[mySignalStart + 338]); // line circom 1982
Fr_add(&expaux[0],&signalValues[mySignalStart + 62],&expaux[1]); // line circom 1982
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 109;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[69]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 109;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 339];
// load src
cmp_index_ref_load = 109;
cmp_index_ref_load = 109;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[109]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 340];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 27]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 341];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 31]);
}
{
uint cmp_index_ref = 110;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 341]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 342];
// load src
cmp_index_ref_load = 110;
cmp_index_ref_load = 110;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[110]].signalStart + 0]); // line circom 2006
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 111;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 341]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 111;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 63]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 112;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 63]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 112;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 341]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 343];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 340]); // line circom 2028
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 344];
// load src
cmp_index_ref_load = 112;
cmp_index_ref_load = 112;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[112]].signalStart + 0],&signalValues[mySignalStart + 63]); // line circom 2036
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 345];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 342],&signalValues[mySignalStart + 344]); // line circom 2040
Fr_add(&expaux[0],&signalValues[mySignalStart + 63],&expaux[1]); // line circom 2040
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 346];
// load src
cmp_index_ref_load = 111;
cmp_index_ref_load = 111;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[111]].signalStart + 0],&signalValues[mySignalStart + 345]); // line circom 2044
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 347];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 340],&signalValues[mySignalStart + 346]); // line circom 2047
Fr_add(&expaux[0],&signalValues[mySignalStart + 345],&expaux[1]); // line circom 2047
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 348];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 347],&signalValues[mySignalStart + 63]); // line circom 2052
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 64];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 339],&signalValues[mySignalStart + 348]); // line circom 2054
Fr_add(&expaux[0],&signalValues[mySignalStart + 63],&expaux[1]); // line circom 2054
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 113;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[71]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 113;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 349];
// load src
cmp_index_ref_load = 113;
cmp_index_ref_load = 113;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[113]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 350];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 28]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 351];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 32]);
}
{
uint cmp_index_ref = 114;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 351]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 352];
// load src
cmp_index_ref_load = 114;
cmp_index_ref_load = 114;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[114]].signalStart + 0]); // line circom 2078
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 115;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 351]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 115;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 64]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 116;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 64]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 116;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 351]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 353];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 350]); // line circom 2100
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 354];
// load src
cmp_index_ref_load = 116;
cmp_index_ref_load = 116;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[116]].signalStart + 0],&signalValues[mySignalStart + 64]); // line circom 2108
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 355];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 352],&signalValues[mySignalStart + 354]); // line circom 2112
Fr_add(&expaux[0],&signalValues[mySignalStart + 64],&expaux[1]); // line circom 2112
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 356];
// load src
cmp_index_ref_load = 115;
cmp_index_ref_load = 115;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[115]].signalStart + 0],&signalValues[mySignalStart + 355]); // line circom 2116
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 357];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 350],&signalValues[mySignalStart + 356]); // line circom 2119
Fr_add(&expaux[0],&signalValues[mySignalStart + 355],&expaux[1]); // line circom 2119
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 358];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 357],&signalValues[mySignalStart + 64]); // line circom 2124
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 65];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 349],&signalValues[mySignalStart + 358]); // line circom 2126
Fr_add(&expaux[0],&signalValues[mySignalStart + 64],&expaux[1]); // line circom 2126
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 117;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[73]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 117;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 359];
// load src
cmp_index_ref_load = 117;
cmp_index_ref_load = 117;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[117]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 360];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 29]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 361];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 33]);
}
{
uint cmp_index_ref = 118;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 361]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 362];
// load src
cmp_index_ref_load = 118;
cmp_index_ref_load = 118;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[118]].signalStart + 0]); // line circom 2150
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 119;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 361]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 119;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 65]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 120;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 65]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 120;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 361]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 363];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 360]); // line circom 2172
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 364];
// load src
cmp_index_ref_load = 120;
cmp_index_ref_load = 120;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[120]].signalStart + 0],&signalValues[mySignalStart + 65]); // line circom 2180
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 365];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 362],&signalValues[mySignalStart + 364]); // line circom 2184
Fr_add(&expaux[0],&signalValues[mySignalStart + 65],&expaux[1]); // line circom 2184
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 366];
// load src
cmp_index_ref_load = 119;
cmp_index_ref_load = 119;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[119]].signalStart + 0],&signalValues[mySignalStart + 365]); // line circom 2188
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 367];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 360],&signalValues[mySignalStart + 366]); // line circom 2191
Fr_add(&expaux[0],&signalValues[mySignalStart + 365],&expaux[1]); // line circom 2191
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 368];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 367],&signalValues[mySignalStart + 65]); // line circom 2196
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 66];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 359],&signalValues[mySignalStart + 368]); // line circom 2198
Fr_add(&expaux[0],&signalValues[mySignalStart + 65],&expaux[1]); // line circom 2198
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 121;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[75]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 121;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 369];
// load src
cmp_index_ref_load = 121;
cmp_index_ref_load = 121;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[121]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 370];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 30]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 371];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 34]);
}
{
uint cmp_index_ref = 122;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 371]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 372];
// load src
cmp_index_ref_load = 122;
cmp_index_ref_load = 122;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[122]].signalStart + 0]); // line circom 2222
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 123;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 371]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 123;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 66]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 124;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 66]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 124;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 371]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 373];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 370]); // line circom 2244
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 374];
// load src
cmp_index_ref_load = 124;
cmp_index_ref_load = 124;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[124]].signalStart + 0],&signalValues[mySignalStart + 66]); // line circom 2252
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 375];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 372],&signalValues[mySignalStart + 374]); // line circom 2256
Fr_add(&expaux[0],&signalValues[mySignalStart + 66],&expaux[1]); // line circom 2256
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 376];
// load src
cmp_index_ref_load = 123;
cmp_index_ref_load = 123;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[123]].signalStart + 0],&signalValues[mySignalStart + 375]); // line circom 2260
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 377];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 370],&signalValues[mySignalStart + 376]); // line circom 2263
Fr_add(&expaux[0],&signalValues[mySignalStart + 375],&expaux[1]); // line circom 2263
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 378];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 377],&signalValues[mySignalStart + 66]); // line circom 2268
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 67];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 369],&signalValues[mySignalStart + 378]); // line circom 2270
Fr_add(&expaux[0],&signalValues[mySignalStart + 66],&expaux[1]); // line circom 2270
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 125;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[77]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 125;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_31_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 379];
// load src
cmp_index_ref_load = 125;
cmp_index_ref_load = 125;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[125]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 380];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 31]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 381];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 35]);
}
{
uint cmp_index_ref = 126;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 381]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsZero_10_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 382];
// load src
cmp_index_ref_load = 126;
cmp_index_ref_load = 126;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[126]].signalStart + 0]); // line circom 2294
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 127;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 381]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 127;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 67]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 128;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 67]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 128;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 381]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 383];
// load src
Fr_sub(&expaux[0],&circuitConstants[1],&signalValues[mySignalStart + 380]); // line circom 2316
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 384];
// load src
cmp_index_ref_load = 128;
cmp_index_ref_load = 128;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[128]].signalStart + 0],&signalValues[mySignalStart + 67]); // line circom 2324
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 385];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 382],&signalValues[mySignalStart + 384]); // line circom 2328
Fr_add(&expaux[0],&signalValues[mySignalStart + 67],&expaux[1]); // line circom 2328
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 386];
// load src
cmp_index_ref_load = 127;
cmp_index_ref_load = 127;
Fr_sub(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[127]].signalStart + 0],&signalValues[mySignalStart + 385]); // line circom 2332
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 387];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 380],&signalValues[mySignalStart + 386]); // line circom 2335
Fr_add(&expaux[0],&signalValues[mySignalStart + 385],&expaux[1]); // line circom 2335
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 388];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 387],&signalValues[mySignalStart + 67]); // line circom 2340
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 68];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + 379],&signalValues[mySignalStart + 388]); // line circom 2342
Fr_add(&expaux[0],&signalValues[mySignalStart + 67],&expaux[1]); // line circom 2342
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 129;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 68]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 129;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 3]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsEqual_28_run(mySubcomponents[cmp_index_ref],ctx);
}
{
cmp_index_ref_load = 129;
cmp_index_ref_load = 129;
{{
Fr_eq(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[129]].signalStart + 0],&circuitConstants[1]); // line circom 2350
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 2350. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 130; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Bits2Num_33_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 33;
ctx->componentMemory[coffset].templateName = "Bits2Num";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 24;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Bits2Num_33_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[63]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[63]); // line circom 61
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 1)],&lvar[2]); // line circom 62
Fr_add(&expaux[0],&lvar[1],&expaux[1]); // line circom 62
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&lvar[2]); // line circom 63
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
Fr_add(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 61
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[63]); // line circom 61
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
// end load src
Fr_copy(aux_dest,&lvar[1]);
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void UnpackUnlocksAt_34_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 34;
ctx->componentMemory[coffset].templateName = "UnpackUnlocksAt";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[3]{0};
}

void UnpackUnlocksAt_34_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[1];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "n2b";
Num2Bits_8_create(mySignalStart+53,2+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 2+ctx_index+1;
}
{
std::string new_cmp_name = "b2n_unlocks";
Bits2Num_33_create(mySignalStart+28,1+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 1+ctx_index+1;
}
{
std::string new_cmp_name = "b2n_lock";
Bits2Num_33_create(mySignalStart+3,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[2] = 0+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 254];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_8_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[63]); // line circom 31
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 1)];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
Bits2Num_33_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 31
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[63]); // line circom 31
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[63]); // line circom 38
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 1)];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ((1 * (24 + Fr_toInt(&lvar[0]))) + 0)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
Bits2Num_33_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 38
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[63]); // line circom 38
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + 0]);
}
for (uint i = 0; i < 3; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Num2Bits_35_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 35;
ctx->componentMemory[coffset].templateName = "Num2Bits";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[0];
}

void Num2Bits_35_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[4];
FrElement lvar[4];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[189]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[189]); // line circom 31
while(Fr_isTrue(&expaux[0])){
{
PFrElement aux_dest = &signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)];
// load src
Fr_shr(&expaux[1],&signalValues[mySignalStart + 253],&lvar[3]); // line circom 32
Fr_band(&expaux[0],&expaux[1],&circuitConstants[1]); // line circom 32
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
Fr_sub(&expaux[2],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&circuitConstants[1]); // line circom 33
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&expaux[2]); // line circom 33
{{
Fr_eq(&expaux[0],&expaux[1],&circuitConstants[0]); // line circom 33
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 33. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &lvar[1];
// load src
Fr_mul(&expaux[1],&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[3])) + 0)],&lvar[2]); // line circom 34
Fr_add(&expaux[0],&lvar[1],&expaux[1]); // line circom 34
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
Fr_add(&expaux[0],&lvar[2],&lvar[2]); // line circom 35
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
Fr_add(&expaux[0],&lvar[3],&circuitConstants[1]); // line circom 31
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[3],&circuitConstants[189]); // line circom 31
}
{
{{
Fr_eq(&expaux[0],&lvar[1],&signalValues[mySignalStart + 253]); // line circom 38
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 38. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
for (uint i = 0; i < 0; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void LessThan_36_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 36;
ctx->componentMemory[coffset].templateName = "LessThan";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 2;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[1]{0};
}

void LessThan_36_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[3];
FrElement lvar[1];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[190]);
}
{
std::string new_cmp_name = "n2b";
Num2Bits_35_create(mySignalStart+3,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
if (!Fr_isTrue(&circuitConstants[1])) std::cout << "Failed assert in template/function " << myTemplateName << " line 90. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&circuitConstants[1]));
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 253];
// load src
Fr_add(&expaux[1],&signalValues[mySignalStart + 1],&circuitConstants[191]); // line circom 96
Fr_sub(&expaux[0],&expaux[1],&signalValues[mySignalStart + 2]); // line circom 96
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_35_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 252]); // line circom 98
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 1; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void GreaterThanOrEqualField_37_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 37;
ctx->componentMemory[coffset].templateName = "GreaterThanOrEqualField";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 2;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[1]{0};
}

void GreaterThanOrEqualField_37_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "lt";
LessThan_36_create(mySignalStart+3,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
LessThan_36_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
Fr_sub(&expaux[0],&circuitConstants[1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]); // line circom 43
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 1; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void PoseidonKeystream_38_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 38;
ctx->componentMemory[coffset].templateName = "PoseidonKeystream";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 2;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[1]{0};
}

void PoseidonKeystream_38_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[1];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "hash";
Poseidon2Hash2_6_create(mySignalStart+3,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]);
}
for (uint i = 0; i < 1; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void PoseidonCTREncrypt_39_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 39;
ctx->componentMemory[coffset].templateName = "PoseidonCTREncrypt";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 3;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[1]{0};
}

void PoseidonCTREncrypt_39_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[1];
FrElement lvar[0];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "keystream_gen";
PoseidonKeystream_38_create(mySignalStart+4,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 0+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 3]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
PoseidonKeystream_38_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
Fr_add(&expaux[0],&signalValues[mySignalStart + 1],&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]); // line circom 34
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
for (uint i = 0; i < 1; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void PedersenCommitment2FixedM1_40_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 40;
ctx->componentMemory[coffset].templateName = "PedersenCommitment2FixedM1";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 1;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[3]{0};
}

void PedersenCommitment2FixedM1_40_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[5];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "r_bits";
Num2Bits_8_create(mySignalStart+7918,1024+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 1024+ctx_index+1;
}
{
std::string new_cmp_name = "rH";
EscalarMulAny_22_create(mySignalStart+13,1+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 1+ctx_index+1;
}
{
std::string new_cmp_name = "add";
BabyAdd_17_create(mySignalStart+3,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[2] = 0+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 254];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Num2Bits_8_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[184]);
}
{
PFrElement aux_dest = &lvar[1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[185]);
}
{
PFrElement aux_dest = &lvar[2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[178]);
}
{
PFrElement aux_dest = &lvar[3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[179]);
}
{
PFrElement aux_dest = &lvar[4];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[4],&circuitConstants[162]); // line circom 87
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[4])) + 2)];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + ((1 * Fr_toInt(&lvar[4])) + 0)]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
PFrElement aux_dest = &lvar[4];
// load src
Fr_add(&expaux[0],&lvar[4],&circuitConstants[1]); // line circom 87
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[4],&circuitConstants[162]); // line circom 87
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 256];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[178]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 257];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[179]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
EscalarMulAny_22_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[184]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[185]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + 1]);
}
for (uint i = 0; i < 3; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void Withdraw_41_create(uint soffset,uint coffset,Circom_CalcWit* ctx,std::string componentName,uint componentFather){
ctx->componentMemory[coffset].templateId = 41;
ctx->componentMemory[coffset].templateName = "Withdraw";
ctx->componentMemory[coffset].signalStart = soffset;
ctx->componentMemory[coffset].inputCounter = 48;
ctx->componentMemory[coffset].componentName = componentName;
ctx->componentMemory[coffset].idFather = componentFather;
ctx->componentMemory[coffset].subcomponents = new uint[22]{0};
}

void Withdraw_41_run(uint ctx_index,Circom_CalcWit* ctx){
FrElement* circuitConstants = ctx->circuitConstants;
FrElement* signalValues = ctx->signalValues;
FrElement expaux[2];
FrElement lvar[1];
u64 mySignalStart = ctx->componentMemory[ctx_index].signalStart;
std::string myTemplateName = ctx->componentMemory[ctx_index].templateName;
std::string myComponentName = ctx->componentMemory[ctx_index].componentName;
u64 myFather = ctx->componentMemory[ctx_index].idFather;
u64 myId = ctx_index;
u32* mySubcomponents = ctx->componentMemory[ctx_index].subcomponents;
bool* mySubcomponentsParallel = ctx->componentMemory[ctx_index].subcomponentsParallel;
std::string* listOfTemplateMessages = ctx->listOfTemplateMessages;
uint sub_component_aux;
uint index_multiple_eq;
int cmp_index_ref_load = -1;
{
std::string new_cmp_name = "spending_key_hash";
Poseidon2Hash3_5_create(mySignalStart+165902,17113+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[0] = 17113+ctx_index+1;
}
{
std::string new_cmp_name = "view_key_hash";
Poseidon2Hash2_6_create(mySignalStart+168181,17283+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[1] = 17283+ctx_index+1;
}
{
std::string new_cmp_name = "previous_nonce_commitment_hash";
Poseidon2Hash3_5_create(mySignalStart+155768,15922+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[2] = 15922+ctx_index+1;
}
{
std::string new_cmp_name = "base3_commit";
PedersenCommitmentBase3_25_create(mySignalStart+64,0+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[3] = 0+ctx_index+1;
}
{
std::string new_cmp_name = "previous_m1G";
PedersenCommitmentM1_26_create(mySignalStart+151659,15405+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[4] = 15405+ctx_index+1;
}
{
std::string new_cmp_name = "previous_rJ";
PedersenCommitmentR_27_create(mySignalStart+157479,16085+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[5] = 16085+ctx_index+1;
}
{
std::string new_cmp_name = "previous_add1";
BabyAdd_17_create(mySignalStart+149929,15240+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[6] = 15240+ctx_index+1;
}
{
std::string new_cmp_name = "previous_add2";
BabyAdd_17_create(mySignalStart+149939,15241+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[7] = 15241+ctx_index+1;
}
{
std::string new_cmp_name = "previous_leaf_hash";
Poseidon2Hash2_6_create(mySignalStart+149949,15242+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[8] = 15242+ctx_index+1;
}
{
std::string new_cmp_name = "leaf_eq";
IsEqual_28_create(mySignalStart+16567,1973+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[9] = 1973+ctx_index+1;
}
{
std::string new_cmp_name = "merkle_verify";
LeanIMTVerify_32_create(mySignalStart+16573,1975+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[10] = 1975+ctx_index+1;
}
{
std::string new_cmp_name = "unpack";
UnpackUnlocksAt_34_create(mySignalStart+167873,17279+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[11] = 17279+ctx_index+1;
}
{
std::string new_cmp_name = "time_check";
GreaterThanOrEqualField_37_create(mySignalStart+167613,17276+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[12] = 17276+ctx_index+1;
}
{
std::string new_cmp_name = "new_nonce_commitment_hash";
Poseidon2Hash3_5_create(mySignalStart+131882,13026+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[13] = 13026+ctx_index+1;
}
{
std::string new_cmp_name = "shares_check";
GreaterThanOrEqualField_37_create(mySignalStart+165642,17110+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[14] = 17110+ctx_index+1;
}
{
std::string new_cmp_name = "new_m1G";
PedersenCommitmentM1_26_create(mySignalStart+127773,12509+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[15] = 12509+ctx_index+1;
}
{
std::string new_cmp_name = "new_rJ";
PedersenCommitmentR_27_create(mySignalStart+133593,13189+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[16] = 13189+ctx_index+1;
}
{
std::string new_cmp_name = "new_add1";
BabyAdd_17_create(mySignalStart+127753,12507+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[17] = 12507+ctx_index+1;
}
{
std::string new_cmp_name = "new_add2";
BabyAdd_17_create(mySignalStart+127763,12508+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[18] = 12508+ctx_index+1;
}
{
std::string new_cmp_name = "encrypt_balance";
PoseidonCTREncrypt_39_create(mySignalStart+13133,1643+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[19] = 1643+ctx_index+1;
}
{
std::string new_cmp_name = "encrypt_nullifier";
PoseidonCTREncrypt_39_create(mySignalStart+14850,1808+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[20] = 1808+ctx_index+1;
}
{
std::string new_cmp_name = "nonce_discovery";
PedersenCommitment2FixedM1_40_create(mySignalStart+141756,14214+ctx_index+1,ctx,new_cmp_name,myId);
mySubcomponents[21] = 14214+ctx_index+1;
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 15]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 9]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 0;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 7]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash3_5_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 55];
// load src
cmp_index_ref_load = 0;
cmp_index_ref_load = 0;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[0]].signalStart + 0]);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[192]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 1;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 15]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 56];
// load src
cmp_index_ref_load = 1;
cmp_index_ref_load = 1;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[1]].signalStart + 0]);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 55]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 16]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 2;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 7]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash3_5_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 57];
// load src
cmp_index_ref_load = 2;
cmp_index_ref_load = 2;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[2]].signalStart + 0]);
}
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 18]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 55]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 3;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 19]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
PedersenCommitmentBase3_25_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 4;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 17]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
PedersenCommitmentM1_26_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 5;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 57]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
PedersenCommitmentR_27_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[4]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 6;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 4;
cmp_index_ref_load = 4;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[4]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 6;
cmp_index_ref_load = 6;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[6]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 6;
cmp_index_ref_load = 6;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[6]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 7;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 5;
cmp_index_ref_load = 5;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[5]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 8;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
cmp_index_ref_load = 7;
cmp_index_ref_load = 7;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[7]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 8;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 7;
cmp_index_ref_load = 7;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[7]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash2_6_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 58];
// load src
cmp_index_ref_load = 8;
cmp_index_ref_load = 8;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[8]].signalStart + 0]);
}
{
uint cmp_index_ref = 9;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 58]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 9;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 20]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
IsEqual_28_run(mySubcomponents[cmp_index_ref],ctx);
}
{
cmp_index_ref_load = 9;
cmp_index_ref_load = 9;
{{
Fr_eq(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[9]].signalStart + 0],&circuitConstants[1]); // line circom 113
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 113. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 0];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 20]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
LeanIMTVerify_32_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 21]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
LeanIMTVerify_32_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 22]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
LeanIMTVerify_32_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 10]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
LeanIMTVerify_32_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[79]); // line circom 123
while(Fr_isTrue(&expaux[0])){
{
uint cmp_index_ref = 10;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + ((1 * Fr_toInt(&lvar[0])) + 4)];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + ((1 * Fr_toInt(&lvar[0])) + 23)]);
}
// run sub component if needed
if(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1)){
LeanIMTVerify_32_run(mySubcomponents[cmp_index_ref],ctx);

}
}
{
PFrElement aux_dest = &lvar[0];
// load src
Fr_add(&expaux[0],&lvar[0],&circuitConstants[1]); // line circom 123
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
Fr_lt(&expaux[0],&lvar[0],&circuitConstants[79]); // line circom 123
}
{
uint cmp_index_ref = 11;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 19]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
UnpackUnlocksAt_34_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 59];
// load src
cmp_index_ref_load = 11;
cmp_index_ref_load = 11;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[11]].signalStart + 1]);
}
{
uint cmp_index_ref = 12;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 11]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 12;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 59]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
GreaterThanOrEqualField_37_run(mySubcomponents[cmp_index_ref],ctx);
}
{
cmp_index_ref_load = 12;
cmp_index_ref_load = 12;
{{
Fr_eq(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[12]].signalStart + 0],&circuitConstants[1]); // line circom 138
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 138. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 60];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 16],&circuitConstants[1]); // line circom 142
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 13;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 55]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 13;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 60]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 13;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 7]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
Poseidon2Hash3_5_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 2];
// load src
cmp_index_ref_load = 13;
cmp_index_ref_load = 13;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[13]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 61];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 8],&signalValues[mySignalStart + 14]); // line circom 155
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 62];
// load src
Fr_add(&expaux[0],&signalValues[mySignalStart + 61],&circuitConstants[1]); // line circom 160
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 14;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 17]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 14;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 62]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
GreaterThanOrEqualField_37_run(mySubcomponents[cmp_index_ref],ctx);
}
{
cmp_index_ref_load = 14;
cmp_index_ref_load = 14;
{{
Fr_eq(&expaux[0],&ctx->signalValues[ctx->componentMemory[mySubcomponents[14]].signalStart + 0],&circuitConstants[1]); // line circom 164
}}
if (!Fr_isTrue(&expaux[0])) std::cout << "Failed assert in template/function " << myTemplateName << " line 164. " <<  "Followed trace of components: " << ctx->getTrace(myId) << std::endl;
assert(Fr_isTrue(&expaux[0]));
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 63];
// load src
Fr_sub(&expaux[0],&signalValues[mySignalStart + 17],&signalValues[mySignalStart + 61]); // line circom 170
// end load src
Fr_copy(aux_dest,&expaux[0]);
}
{
uint cmp_index_ref = 15;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 63]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
PedersenCommitmentM1_26_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 16;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
PedersenCommitmentR_27_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 17;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 17;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 3;
cmp_index_ref_load = 3;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[3]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 17;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 15;
cmp_index_ref_load = 15;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[15]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 17;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 15;
cmp_index_ref_load = 15;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[15]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
uint cmp_index_ref = 18;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
cmp_index_ref_load = 17;
cmp_index_ref_load = 17;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[17]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 18;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
cmp_index_ref_load = 17;
cmp_index_ref_load = 17;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[17]].signalStart + 1]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 18;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 4];
// load src
cmp_index_ref_load = 16;
cmp_index_ref_load = 16;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[16]].signalStart + 0]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 18;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 5];
// load src
cmp_index_ref_load = 16;
cmp_index_ref_load = 16;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[16]].signalStart + 1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
BabyAdd_17_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 0];
// load src
cmp_index_ref_load = 18;
cmp_index_ref_load = 18;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[18]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 1];
// load src
cmp_index_ref_load = 18;
cmp_index_ref_load = 18;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[18]].signalStart + 1]);
}
{
uint cmp_index_ref = 19;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 63]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 19;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 56]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 19;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[0]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
PoseidonCTREncrypt_39_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 3];
// load src
cmp_index_ref_load = 19;
cmp_index_ref_load = 19;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[19]].signalStart + 0]);
}
{
uint cmp_index_ref = 20;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 1];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 18]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 20;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 56]);
}
// no need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter > 0);
}
{
uint cmp_index_ref = 20;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 3];
// load src
// end load src
Fr_copy(aux_dest,&circuitConstants[1]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
PoseidonCTREncrypt_39_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 4];
// load src
cmp_index_ref_load = 20;
cmp_index_ref_load = 20;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[20]].signalStart + 0]);
}
{
uint cmp_index_ref = 21;
{
PFrElement aux_dest = &ctx->signalValues[ctx->componentMemory[mySubcomponents[cmp_index_ref]].signalStart + 2];
// load src
// end load src
Fr_copy(aux_dest,&signalValues[mySignalStart + 2]);
}
// need to run sub component
ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter -= 1;
assert(!(ctx->componentMemory[mySubcomponents[cmp_index_ref]].inputCounter));
PedersenCommitment2FixedM1_40_run(mySubcomponents[cmp_index_ref],ctx);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 5];
// load src
cmp_index_ref_load = 21;
cmp_index_ref_load = 21;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[21]].signalStart + 0]);
}
{
PFrElement aux_dest = &signalValues[mySignalStart + 6];
// load src
cmp_index_ref_load = 21;
cmp_index_ref_load = 21;
// end load src
Fr_copy(aux_dest,&ctx->signalValues[ctx->componentMemory[mySubcomponents[21]].signalStart + 1]);
}
for (uint i = 0; i < 22; i++){
uint index_subc = ctx->componentMemory[ctx_index].subcomponents[i];
if (index_subc != 0)release_memory_component(ctx,index_subc);
}
}

void run(Circom_CalcWit* ctx){
Withdraw_41_create(1,0,ctx,"main",0);
Withdraw_41_run(0,ctx);
}

