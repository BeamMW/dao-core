// Copyright 2018-2021 The Beam Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#define HOST_BUILD

#include "../../beam/core/block_rw.h"
#include "../../beam/bvm/bvm2_impl.h"

namespace Shaders {

#ifdef _MSC_VER
#	pragma warning (disable : 4200 4702) // unreachable code
#endif // _MSC_VER

#define BEAM_EXPORT

#include "Shaders/common.h"

#include "../shaders/contract.h"


	template <bool bToShader> void Convert(DemoXdao::UpdPosFarming& x) {
		ConvertOrd<bToShader>(x.m_Beam);
		ConvertOrd<bToShader>(x.m_WithdrawBeamX);
	}
	template <bool bToShader> void Convert(DemoXdao::GetPreallocated& x) {
		ConvertOrd<bToShader>(x.m_Amount);
	}


	namespace DemoXdao {
#include "../shaders/contract_sid.i"
#include "../shaders/contract.cpp"
	}

#ifdef _MSC_VER
#	pragma warning (default : 4200 4702)
#endif // _MSC_VER
}

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

namespace beam {
	namespace bvm2 {

		struct MyProcessor
			:public ContractTestProcessor
		{

			struct Code
			{
				ByteBuffer m_DemoXdao;

			} m_Code;

			ContractID m_cidDemoXdao;


			void CallFar(const ContractID& cid, uint32_t iMethod, Wasm::Word pArgs) override
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

		template <>
		struct MyProcessor::Converter<beam::Zero_>
			:public Blob
		{
			Converter(beam::Zero_&)
			{
				p = nullptr;
				n = 0;
			}
		};


		void MyProcessor::TestAll()
		{
			AddCode(m_Code.m_DemoXdao, "contract.wasm");

			TestDemoXdao();
		}

		struct CidTxt
		{
			char m_szBuf[Shaders::ContractID::nBytes * 5];

			void Set(const Shaders::ContractID& x)
			{
				char* p = m_szBuf;
				for (uint32_t i = 0; i < x.nBytes; i++)
				{
					if (i)
						*p++ = ',';

					*p++ = '0';
					*p++ = 'x';

					uintBigImpl::_Print(x.m_pData + i, 1, p);
					p += 2;
				}

				assert(p - m_szBuf < (long int)_countof(m_szBuf));
				*p = 0;
			}
		};

		static void VerifyId(const ContractID& cidExp, const ContractID& cid, const char* szName)
		{
			if (cidExp != cid)
			{
				CidTxt ct;
				ct.Set(cid);

				printf("Incorrect %s. Actual value: %s\n", szName, ct.m_szBuf);
				g_TestsFailed++;
				fflush(stdout);
			}
		}

#define VERIFY_ID(exp, actual) VerifyId(exp, actual, #exp)


		struct LutGenerator
		{
			typedef uint64_t TX;
			typedef double TY;
			virtual double Evaluate(TX) = 0;

			std::vector<TX> m_vX;
			std::vector<TY> m_vY;
			std::vector<uint32_t> m_vYNorm;

			bool IsGoodEnough(TX x, TX x1, double y1, double yPrecise, double tolerance)
			{
				const TX& xPrev = m_vX.back();
				const TY& yPrev = m_vY.back();

				double yInterp = yPrev + (y1 - yPrev) * (x - xPrev) / (x1 - xPrev);

				double yErr = yInterp - yPrecise;
				return (fabs(yErr / yPrecise) <= tolerance);
			}

			bool IsGoodEnough(TX x, TX x1, double y1, double tolerance)
			{
				double yPrecise = Evaluate(x);
				return IsGoodEnough(x, x1, y1, yPrecise, tolerance);
			}

			void Generate(TX x0, TX x1, double tolerance)
			{
				assert(x0 < x1);

				m_vX.push_back(x0);
				m_vY.push_back(Evaluate(x0));

				double y1 = Evaluate(x1);

				while (true)
				{
					TX xNext = x1;
					TY yNext = y1;

					uint32_t nCycles = 0;
					for (; ; nCycles++)
					{
						// probe 3 points: begin, end, mid
						const TX& xPrev = m_vX.back();
						TX dx = xNext - xPrev;
						TX xMid = xPrev + dx / 2;
						double yMid = Evaluate(xMid);

						bool bOk = true;
						double tolerance_der = tolerance / (double)(dx - 2);
						if (bOk && !IsGoodEnough(xPrev + 1, xNext, yNext, tolerance_der))
							bOk = false;

						if (bOk && !IsGoodEnough(xNext - 1, xNext, yNext, tolerance_der))
							bOk = false;

						if (bOk && !IsGoodEnough(xMid, xNext, yNext, yMid, tolerance))
							bOk = false;

						if (bOk)
							break;

						xNext = xMid;
						yNext = yMid;
					}

					m_vX.push_back(xNext);
					m_vY.push_back(yNext);

					if (!nCycles)
						break;
				}

			}

			void Normalize(uint32_t nMax)
			{
				double maxVal = 0;
				for (size_t i = 0; i < m_vY.size(); i++)
					std::setmax(maxVal, m_vY[i]);

				m_vYNorm.resize(m_vY.size());
				for (size_t i = 0; i < m_vY.size(); i++)
					m_vYNorm[i] = static_cast<uint32_t>(nMax * m_vY[i] / maxVal);
			}
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


	} // namespace bvm2
} // namespace beam

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
