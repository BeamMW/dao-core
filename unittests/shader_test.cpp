#define HOST_BUILD

#include <cstdint>
#include <cstdio>
#include <exception>
#include "utility/common.h"

#include "core/block_rw.h"
#include "core/keccak.h"
#include "utility/test_helpers.h"
#include "utility/blobmap.h"
#include "bvm2.h"
#include "bvm2_impl.h"

namespace Shaders
{
	namespace DemoXdao {
#include "../shaders/contract.cpp"
	}
} // namespace Shaders

int g_TestsFailed = 0;

void TestFailed(const char* szExpr, uint32_t nLine)
{
    printf("Test failed! Line=%u, Expression: %s\n", nLine, szExpr);
    g_TestsFailed++;
    fflush(stdout);
}

#define verify_test(x) \
    do { \
        if (!(x)) \
            TestFailed(#x, __LINE__); \
    } while (false)

#define fail_test(msg) TestFailed(msg, __LINE__)

using namespace beam;
using namespace beam::bvm2;

#include "unittest/contract_test_processor.h"

struct MyProcessor
    : public ContractTestProcessor
{
    struct Code
    {
        ByteBuffer m_DemoXdao;

    } m_Code;

    ContractID m_cidDemoXdao;

    virtual void CallFar(const ContractID& cid, uint32_t iMethod, Wasm::Word pArgs) override
    {
        if (cid == m_cidDemoXdao)
        {
            //TempFrame f(*this, cid);
            //switch (iMethod)
            //{
            //case 0: Shaders::DemoXdao::Ctor(nullptr); return;
            //case 3: Shaders::DemoXdao::Method_3(CastArg<Shaders::DemoXdao::GetPreallocated>(pArgs)); return;
            //case 4: Shaders::DemoXdao::Method_4(CastArg<Shaders::DemoXdao::UpdPosFarming>(pArgs)); return;
            //}
        }

        ProcessorContract::CallFar(cid, iMethod, pArgs);
    }

    void TestDemoXdao();
	void TestAll();
};

void MyProcessor::TestDemoXdao()
{
	//struct MyLutGenerator
	//	:public LutGenerator
	//{
	//	virtual double Evaluate(TX x)
	//	{
	//		double k = ((double) x) / (double) (Shaders::g_Beam2Groth * 100);
	//		return pow(k, 0.7);
	//	}
	//};

	//MyLutGenerator lg;
	//lg.Generate(Shaders::g_Beam2Groth * 16, Shaders::g_Beam2Groth * 1000000, 0.1);
	//lg.Normalize(1000000);

	Zero_ zero;
	verify_test(ContractCreate_T(m_cidDemoXdao, m_Code.m_DemoXdao, zero));

	bvm2::ShaderID sid;
	bvm2::get_ShaderID(sid, m_Code.m_DemoXdao);
	VERIFY_ID(Shaders::DemoXdao::s_SID, sid);

	for (uint32_t i = 0; i < 10; i++)
	{
		Shaders::DemoXdao::UpdPosFarming args;
		ZeroObject(args);

		args.m_Beam = Shaders::g_Beam2Groth * 20000 * (i + 3);
		args.m_BeamLock = 1;
		args.m_Pk.m_X = i;
		verify_test(RunGuarded_T(m_cidDemoXdao, args.s_iMethod, args));

		if (i & 1)
			m_Height += 1000;
	}

	for (uint32_t i = 0; i < 10; i++)
	{
		Shaders::DemoXdao::UpdPosFarming args;
		ZeroObject(args);

		args.m_Beam = Shaders::g_Beam2Groth * 20000 * (i + 3);
		args.m_Pk.m_X = i;
		verify_test(RunGuarded_T(m_cidDemoXdao, args.s_iMethod, args));

		if (i & 1)
			m_Height += 1000;
	}

	// the following is disabled, since the contract in this test is standalone, not under Upgradable, hence it doesn' allocate anything in c'tor
/*
		{
			Shaders::DemoXdao::GetPreallocated args;
			ZeroObject(args);
			args.m_Amount = 50;
			Cast::Reinterpret<beam::uintBig_t<33> >(args.m_Pk).Scan("8bb3375b455d9c577134b00e8b0b108a29ce2bc0fce929049306cf4fed723b7d00");
			verify_test(!RunGuarded_T(m_cidDemoXdao, args.s_iMethod, args)); // wrong pk

			Cast::Reinterpret<beam::uintBig_t<33> >(args.m_Pk).Scan("8bb3375b455d9c577134b00e8b0b108a29ce2bc0fce929049306cf4fed723b7d01");
			verify_test(RunGuarded_T(m_cidDemoXdao, args.s_iMethod, args)); // ok

			args.m_Amount = 31000 / 2 * Shaders::g_Beam2Groth;
			verify_test(!RunGuarded_T(m_cidDemoXdao, args.s_iMethod, args)); // too much
		}
*/
}

void MyProcessor::TestAll()
{
	AddCode(m_Code.m_DemoXdao, "demoXdao/contract.wasm");

	TestDemoXdao();
}

int main()
{
	try
	{
		ECC::PseudoRandomGenerator prg;
		ECC::PseudoRandomGenerator::Scope scope(&prg);

		MyProcessor proc;

		proc.TestAll();
	}
	catch (const std::exception& ex)
	{
		printf("Expression: %s\n", ex.what());
		g_TestsFailed++;
	}

	return g_TestsFailed ? -1 : 0;
}
